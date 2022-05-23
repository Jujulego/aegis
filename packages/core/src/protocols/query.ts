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
export interface AegisQuery<T> extends EventTarget {
  // Methods
  dispatchEvent(event: QueryUpdateEvent<T>): boolean;
  addEventListener(type: 'update', callback: QueryUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'update', callback: QueryUpdateEventListener<T>, options?: EventListenerOptions | boolean): void;
}

/**
 * Contains query data and status.
 */
export class AegisQuery<T> extends EventTarget {
  // Attributes
  private _state: QueryState<T> = { status: 'pending' };

  // Methods
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

  // Properties
  get status(): QueryStatus {
    return this._state.status;
  }

  get state(): QueryState<T> {
    return this._state;
  }
}
