import { Event } from '../events';

// Type
export interface StoreUpdateEventData<out T> {
  old?: Readonly<T>;
  data: Readonly<T>;
}

export interface StoreUpdateEvent<out T = unknown> extends Event<'update', StoreUpdateEventData<T>> {
  // Attributes
  key?: [string, string];
}
