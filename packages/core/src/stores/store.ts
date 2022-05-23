// Events
export class StoreUpdateEvent<T = unknown> extends Event {
  // Attributes
  type: 'update';

  // Constructor
  constructor(
    readonly entity: string,
    readonly id: string,
    readonly newValue: Readonly<T>,
    readonly oldValue?: Readonly<T>,
  ) {
    super('update');
  }
}

export type StoreUpdateEventListener<T = unknown> = (event: StoreUpdateEvent<T>) => void;

// Store
export interface AegisStore extends EventTarget {
  // Methods
  dispatchEvent(event: StoreUpdateEvent): boolean;
  addEventListener(type: 'update', callback: StoreUpdateEventListener, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'update', callback: StoreUpdateEventListener, options?: EventListenerOptions | boolean): void;
}

export abstract class AegisStore extends EventTarget {
  // Methods
  abstract get<T>(entity: string, id: string): T | undefined;
  abstract set<T>(entity: string, id: string, data: T): T | undefined;
  abstract delete<T>(entity: string, id: string): T | undefined;
}
