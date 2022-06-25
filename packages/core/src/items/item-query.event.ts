import { Event, EventListener, EventListenerOptions } from '../events';
import { QueryUpdateEventData } from '../protocols';

// Type
export interface ItemQueryEvent<T = unknown> extends Event<'query', QueryUpdateEventData<T>> {
  // Attributes
  key?: ['pending' | 'completed' | 'error'];
}

export type ItemQueryListener<T = unknown> = EventListener<ItemQueryEvent<T>>;
export type ItemQueryListenerOptions<T = unknown> = EventListenerOptions<ItemQueryEvent<T>>;
