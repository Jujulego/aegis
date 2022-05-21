// Events
export class StoreUpdateEvent<T = unknown> extends Event {
  // Attributes
  type: 'update';

  readonly entity: string;
  readonly id: string;
  readonly newValue: Readonly<T>;
  readonly oldValue?: Readonly<T>;

  // Constructor
  constructor(entity: string, id: string, newValue: Readonly<T>, oldValue?: Readonly<T>) {
    super('update');

    this.entity = entity;
    this.id = id;
    this.newValue = newValue;
    this.oldValue = oldValue;
  }
}

export type StoreUpdateEventListener<T = unknown> = (event: StoreUpdateEvent<T>) => void;

// Types
export type WatchUnsubscriber = () => void;

// Interface
export interface AegisStore extends EventTarget {
  // Methods
  dispatchEvent(event: StoreUpdateEvent): boolean;
  addEventListener(type: 'update', callback: StoreUpdateEventListener, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'update', callback: StoreUpdateEventListener, options?: EventListenerOptions | boolean): void;
}

// Class
export abstract class AegisStore extends EventTarget {
  // Methods
  abstract get<T>(entity: string, id: string): T | undefined;
  abstract set<T>(entity: string, id: string, data: T): T | undefined;
  abstract delete<T>(entity: string, id: string): T | undefined;

  /**
   * Register a listener for one entity
   * @param entity
   * @param id
   * @param callback
   * @param options
   */
  watch<T>(entity: string, id: string, callback: StoreUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): WatchUnsubscriber {
    const listener: StoreUpdateEventListener<T> = (event) => {
      if (event.entity === entity && event.id === id) {
        callback(event);
      }
    };

    this.addEventListener('update', listener, options);

    return () => this.removeEventListener('update', listener);
  }
}
