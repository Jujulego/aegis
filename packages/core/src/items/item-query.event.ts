import { Event, EventListener, EventListenerOptions } from '../events';
import { QueryUpdateEventData } from '../protocols';

// Type
export interface ItemQueryEvent<out T = unknown> extends Event<'query', QueryUpdateEventData<T>> {
  // Attributes
  key?: ['pending' | 'completed' | 'error'];
}

export type ItemQueryListener<out T = unknown> = EventListener<ItemQueryEvent<T>>;
export type ItemQueryListenerOptions<T = unknown> = EventListenerOptions<ItemQueryEvent<T>>;
