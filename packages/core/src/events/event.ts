import { EventSource } from './event-source';

// Types
export interface Event<T extends string = string, D = unknown> {
  // Attributes
  type: T;
  key?: string[];
  source: EventSource<Event>;

  data: D;
}

export type ExtractEvent<E extends Event, T extends E['type']> = Extract<E, { type: T }>;

export type EventKey<E extends Event> = Exclude<E['key'], undefined>;
export type EventListener<E extends Event = Event> = (event: E) => void;
