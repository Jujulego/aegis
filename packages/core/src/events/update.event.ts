import { Event } from './event';

// Type
export interface UpdateEventData<out T> {
  old?: T;
  data: T;
}

export interface UpdateEvent<out T = unknown> extends Event<'update', UpdateEventData<T>> {
  // Attributes
  target?: [string, string];
}
