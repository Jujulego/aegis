// Types
interface ResourceStatePending<T> {
  readonly status: 'pending';
  readonly data?: T;
}

interface ResourceStateCompleted<T> {
  readonly status: 'completed';
  readonly data: T;
}

interface ResourceStateError {
  readonly status: 'error';
  readonly data: Error;
}

export type ResourceState<T> = ResourceStatePending<T> | ResourceStateCompleted<T> | ResourceStateError;
export type ResourceStatus = ResourceState<unknown>['status'];

// Events
export interface ResourceUpdateEvent<T> extends Event {
  // Attributes
  type: 'update';

  /**
   * Updated resource's state
   */
  readonly newState: Readonly<ResourceState<T>>
}

/**
 * Emitted when a resource is updated
 */
export class ResourceUpdateEvent<T> extends Event {
  // Constructor
  constructor(
    readonly newState: Readonly<ResourceState<T>>
  ) {
    super('update');
  }
}

export type ResourceUpdateEventListener<T> = (event: ResourceUpdateEvent<T>) => void;

// Resource
export interface Resource<T> extends EventTarget {
  // Methods
  dispatchEvent(event: ResourceUpdateEvent<T>): boolean;
  addEventListener(type: 'update', callback: ResourceUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'update', callback: ResourceUpdateEventListener<T>, options?: EventListenerOptions | boolean): void;
}

/**
 * Contains resource data and status.
 */
export class Resource<T> extends EventTarget {
  // Attributes
  private _state: ResourceState<T> = { status: 'pending' };

  // Methods
  /**
   * Mark resource as pending
   */
  markPending(): void {
    this._state = {
      status: 'pending',
      data: this._state.status !== 'error' ? this._state.data : undefined,
    };
    this.dispatchEvent(new ResourceUpdateEvent<T>(this._state));
  }

  /**
   * Store the result and move resource into "completed" status
   * @param data
   */
  store(data: T): void {
    this._state = { status: 'completed', data };
    this.dispatchEvent(new ResourceUpdateEvent<T>(this._state));
  }

  /**
   * Store the error and move resource into "error" status
   * @param data
   */
  error(data: Error): void {
    this._state = { status: 'error', data };
    this.dispatchEvent(new ResourceUpdateEvent<T>(this._state));
  }

  // Properties
  get status(): ResourceStatus {
    return this._state.status;
  }

  get state(): ResourceState<T> {
    return this._state;
  }
}
