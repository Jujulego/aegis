import { Event } from './event';

// Type
export interface UpdateEventData<out T> {
  old?: Readonly<T>;
  data: Readonly<T>;
}

export interface UpdateEvent<out T = unknown> extends Event<'update', UpdateEventData<T>> {
  // Attributes
  key?: [string, string];
}
