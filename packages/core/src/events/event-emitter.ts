import { PartialKey } from '../utils';

import { Event, EventKey, EventListener } from './event';

// Types
export type EventUnsubscribe = () => void;

export interface EventListenerOptions<E extends Event = Event> {
  key?: PartialKey<EventKey<E>>;
  signal?: AbortSignal;
}

// Class
export interface EventEmitter<E extends Event = Event> {
  // Emit
  subscribe(
    type: E['type'],
    listener: EventListener<E>,
    opts?: EventListenerOptions<E>
  ): EventUnsubscribe;
}
