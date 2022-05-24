// Types
export type TypedEventListener<E extends Event> = (event: E) => void;

// Typed Event
export class TypedEvent<T extends string = string> extends Event {
  // Attributes
  type: T;

  // Constructor
  constructor(type: T) {
    super(type);
  }
}

// Typed EventTarget
export interface TypedEventTarget<E extends TypedEvent> extends EventTarget {
  // Methods
  dispatchEvent(event: E): boolean;

  addEventListener<T extends E['type']>(type: T, callback: TypedEventListener<Extract<E, TypedEvent<T>>>, options?: AddEventListenerOptions | boolean): void;
  addEventListener(type: E['type'], callback: TypedEventListener<E>, options?: AddEventListenerOptions | boolean): void;

  removeEventListener<T extends E['type']>(type: T, callback: TypedEventListener<Extract<E, TypedEvent<T>>>, options?: EventListenerOptions | boolean): void;
  removeEventListener(type: E['type'], callback: TypedEventListener<E>, options?: EventListenerOptions | boolean): void;
}

export class TypedEventTarget<E extends TypedEvent> extends EventTarget {}
