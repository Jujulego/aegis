import { EventSource } from '../events';

// Types
interface QueryStatePending {
  readonly status: 'pending';
}

interface QueryStateCompleted<T> {
  readonly status: 'completed';
  readonly result: T;
}

interface QueryStateFailed {
  readonly status: 'failed';
  readonly error: Error;
}

export type QueryState<T> = QueryStatePending | QueryStateCompleted<T> | QueryStateFailed;
export type QueryStatus = QueryState<unknown>['status'];

export type QueryEventMap<D> = {
  update: { data: Readonly<QueryState<D>>, filters: [Exclude<QueryStatus, 'pending'>] },
}

// Query
/**
 * Represents a data query.
 *
 * A query can be in 3 three status:
 * - pending: the query is running
 * - completed: the query ended successfully
 * - failed: the query failed
 *
 * An update event is emitted when the query's stats changes, containing both the new query state
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
  /**
   * Build a query from a promise.
   * Query will be completed when promise resolves, or will be failed if promise rejects.
   *
   * @param prom the promise to follow
   * @param controller AbortController to be used by query
   */
  static fromPromise<D>(prom: PromiseLike<D>, controller?: AbortController): AegisQuery<D> {
    const query = new AegisQuery<D>(controller);

    prom.then((result) => query.complete(result), (error) => query.fail(error));

    return query;
  }

  // Methods
  then<R1 = D, R2 = never>(
    onfulfilled?: ((value: D) => PromiseLike<R1> | R1) | null | undefined,
    onrejected?: ((reason: Error) => PromiseLike<R2> | R2) | null | undefined
  ): AegisQuery<R1 | R2> {
    const result = new AegisQuery<R1 | R2>(this.controller);

    const listener = async (state: QueryState<D>) => {
      try {
        if (state.status === 'completed') {
          if (onfulfilled) {
            result.complete(await onfulfilled(state.result));
          } else {
            result.complete(state.result as unknown as R1);
          }
        } else if (state.status === 'failed') {
          if (onrejected) {
            result.complete(await onrejected(state.error));
          } else {
            result.fail(state.error);
          }
        }
      } catch (err) {
        result.fail(err);
      }
    };

    if (this.status === 'pending') {
      this.subscribe('update', listener);
    } else {
      listener(this.state);
    }

    return result;
  }

  /**
   * Store the result and move resource into "completed" status
   *
   * @param result
   */
  complete(result: D): void {
    this._state = { status: 'completed', result };

    this.emit('update.completed', this._state);
  }

  /**
   * Store the error and move resource into "error" status
   *
   * @param error
   */
  fail(error: Error): void {
    this._state = { status: 'failed', error };

    this.emit('update.failed', this._state);
  }

  /**
   * Abort query using inner AbortController
   * All events will be ignored
   */
  cancel(): void {
    this.controller.abort();
  }

  // Properties
  /**
   * Returns query status
   */
  get status(): QueryStatus {
    return this._state.status;
  }

  /**
   * Returns query result if completed, undefined in other cases
   */
  get result(): D | undefined {
    return this._state.status === 'completed' ? this._state.result : undefined;
  }

  /**
   * Returns query error if failed, undefined in other cases
   */
  get error(): Error | undefined {
    return this._state.status === 'failed' ? this._state.error : undefined;
  }

  /**
   * Return query inner state
   */
  get state(): Readonly<QueryState<D>> {
    return this._state;
  }
}
