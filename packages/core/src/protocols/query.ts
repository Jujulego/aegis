import { TypedEventTarget } from '../event-target';

import { QueryState, QueryStatus } from './state';
import { QueryUpdateEvent, QueryUpdateEventListener } from './query-update.event';

// Query
/**
 * Contains query data and status.
 */
export class AegisQuery<T> extends TypedEventTarget<QueryUpdateEvent<T>> {
  // Attributes
  private _state: QueryState<T> = { status: 'pending' };

  // Constructor
  constructor(
    readonly controller = new AbortController(),
  ) {
    super();
  }

  // Methods
  addEventListener(type: 'update', callback: QueryUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void {
    // Set query's abort controller as default signal
    const opts = typeof options === 'boolean' ? { capture: options } : options ?? {};
    opts.signal ??= this.controller.signal;

    return super.addEventListener(type, callback, opts);
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
