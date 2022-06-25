import { Event, EventListener, EventListenerOptions } from '../events';

// Type
export interface ListUpdateEvent<T = unknown> extends Event<'update', T[]> {
  // Attributes
  key?: [];
}

export type ListUpdateListener<T = unknown> = EventListener<ListUpdateEvent<T>>;
export type ListUpdateListenerOptions<T = unknown> = EventListenerOptions<ListUpdateEvent<T>>;
