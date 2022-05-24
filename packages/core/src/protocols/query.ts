// Types
interface QueryStatePending {
  readonly status: 'pending';
}

interface QueryStateCompleted<T> {
  readonly status: 'completed';
  readonly data: T;
}

interface QueryStateError {
  readonly status: 'error';
  readonly data: Error;
}

export type QueryState<T> = QueryStatePending | QueryStateCompleted<T> | QueryStateError;
export type QueryStatus = QueryState<unknown>['status'];

// Events
/**
 * Emitted when a query is updated
 */
export class QueryUpdateEvent<T> extends Event {
  // Attributes
  type: 'update';

  // Constructor
  constructor(readonly state: Readonly<QueryState<T>>) {
    super('update');
  }
}

export type QueryUpdateEventListener<T> = (event: QueryUpdateEvent<T>) => void;

// Query
/**
 * Contains query data and status.
 */
export class AegisQuery<T> extends EventTarget {
  // Attributes
  private _state: QueryState<T> = { status: 'pending' };

  // Constructor
  constructor(
    readonly controller = new AbortController(),
  ) {
    super();
  }

  // Methods
  dispatchEvent(event: QueryUpdateEvent<T>): boolean {
    return super.dispatchEvent(event);
  }

  addEventListener(type: 'update', callback: QueryUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void {
    // Set query's abort controller as default signal
    const opts = typeof options === 'boolean' ? { capture: options } : options ?? {};
    opts.signal ??= this.controller.signal;

    return super.addEventListener(type, callback, opts);
  }

  removeEventListener(type: 'update', callback: QueryUpdateEventListener<T>, options?: EventListenerOptions | boolean): void {
    super.removeEventListener(type, callback, options);
  }

  /**
   * Store the result and move resource into "completed" status
   * @param data
   */
  store(data: T): void {
    this._state = { status: 'completed', data };
    this.dispatchEvent(new QueryUpdateEvent<T>(this._state));
  }

  /**
   * Store the error and move resource into "error" status
   * @param data
   */
  error(data: Error): void {
    this._state = { status: 'error', data };
    this.dispatchEvent(new QueryUpdateEvent<T>(this._state));
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
