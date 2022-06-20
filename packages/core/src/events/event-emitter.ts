import { PartialKey } from '../utils';

import { Event, EventKey, EventListener } from './event';

// Types
export type EventUnsubscribe = () => void;

export interface EventListenerOptions<E extends Event = Event> {
  key?: PartialKey<EventKey<E>>;
  signal?: AbortSignal;
}

// Class
export interface EventEmitter {
  // Emit
  subscribe(type: string, listener: EventListener, opts?: EventListenerOptions): EventUnsubscribe;
}
