import { Event, EventListener, EventListenerOptions } from '../events';
import { QueryUpdateEventData } from '../protocols';

// Type
export interface ListQueryEvent<T = unknown> extends Event<'query', QueryUpdateEventData<T[]>> {
  // Attributes
  key?: ['pending' | 'completed' | 'error'];
}

export type ListQueryListener<T = unknown> = EventListener<ListQueryEvent<T>>;
export type ListQueryListenerOptions<T = unknown> = EventListenerOptions<ListQueryEvent<T>>;
