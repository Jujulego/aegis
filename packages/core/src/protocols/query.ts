import { EventSource } from '../events';

import { QueryState, QueryStatus } from './query-state';

// Types
export interface QueryUpdateEvent<D> {
  old?: Readonly<QueryState<D>>;
  new: Readonly<QueryState<D>>;
}

export type QueryEventMap<D> = {
  update: { data: QueryUpdateEvent<D>, filters: ['completed' | 'error'] },
}

// Query
/**
 * Contains query data and status.
 */
export class AegisQuery<D> extends EventSource<QueryEventMap<D>> implements PromiseLike<D> {
  // Attributes
  private _state: QueryState<D> = { status: 'pending' };

  // Constructor
  constructor(
    readonly controller = new AbortController(),
  ) {
    super();
  }

  // Statics
  static fromPromise<D>(prom: PromiseLike<D>, controller?: AbortController): AegisQuery<D> {
    const query = new AegisQuery<D>(controller);

    prom.then((result) => query.store(result), (error) => query.error(error));

    return query;
  }

  // Methods
  then<R1 = D, R2 = never>(onfulfilled?: ((value: D) => PromiseLike<R1> | R1) | null | undefined, onrejected?: ((reason: Error) => PromiseLike<R2> | R2) | null | undefined): AegisQuery<R1 | R2> {
    const result = new AegisQuery<R1 | R2>(this.controller);

    const listener = async (state: QueryState<D>) => {
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
      this.subscribe('update', (data) => listener(data.new));
    } else {
      listener(this.state);
    }

    return result;
  }

  /**
   * Store the result and move resource into "completed" status
   * @param data
   */
  store(data: D): void {
    const old = this._state;
    this._state = { status: 'completed', data };

    this.emit('update.completed', { old, new: this._state });
  }

  /**
   * Store the error and move resource into "error" status
   * @param data
   */
  error(data: Error): void {
    const old = this._state;
    this._state = { status: 'error', data };

    this.emit('update.error', { old, new: this._state });
  }

  cancel(): void {
    this.controller.abort();
  }

  // Properties
  get status(): QueryStatus {
    return this._state.status;
  }

  get state(): QueryState<D> {
    return this._state;
  }
}
