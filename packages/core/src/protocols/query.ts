import { EventSource, UpdateEvent } from '../events';

import { QueryState, QueryStatus } from './state';

// Query
/**
 * Contains query data and status.
 */
export class AegisQuery<T> extends EventSource<UpdateEvent<QueryState<T>>> implements PromiseLike<T> {
  // Attributes
  private _state: QueryState<T> = { status: 'pending' };

  // Constructor
  constructor(
    readonly controller = new AbortController(),
  ) {
    super();
  }

  // Statics
  static fromPromise<T>(prom: PromiseLike<T>, controller?: AbortController): AegisQuery<T> {
    const query = new AegisQuery<T>(controller);

    prom.then((result) => query.store(result), (error) => query.error(error));

    return query;
  }

  // Methods
  then<R1 = T, R2 = never>(onfulfilled?: ((value: T) => PromiseLike<R1> | R1) | null | undefined, onrejected?: ((reason: Error) => PromiseLike<R2> | R2) | null | undefined): AegisQuery<R1 | R2> {
    const result = new AegisQuery<R1 | R2>(this.controller);

    const listener = async (state: QueryState<T>) => {
      try {
        if (state.status === 'completed') {
          if (onfulfilled) {
            result.store(await onfulfilled(state.data));
          } else {
            result.store(state.data as unknown as R1);
          }
        } else if (state.status === 'error') {
          if (onrejected) {
            result.store(await onrejected(state.data));
          } else {
            result.error(state.data);
          }
        }
      } catch (err) {
        result.error(err);
      }
    };

    if (this.status === 'pending') {
      this.subscribe('update', ({ data }) => listener(data.data));
    } else {
      listener(this.state);
    }

    return result;
  }

  /**
   * Store the result and move resource into "completed" status
   * @param data
   */
  store(data: T): void {
    const old = this._state;
    this._state = { status: 'completed', data };

    this.emit('update', { old, data: this._state }, { key: ['completed'] });
  }

  /**
   * Store the error and move resource into "error" status
   * @param data
   */
  error(data: Error): void {
    const old = this._state;
    this._state = { status: 'error', data };

    this.emit('update', { old, data: this._state }, { key: ['error'] });
  }

  cancel(): void {
    this.controller.abort();
  }

  // Properties
  get status(): QueryStatus {
    return this._state.status;
  }

  get state(): QueryState<T> {
    return this._state;
  }
}
