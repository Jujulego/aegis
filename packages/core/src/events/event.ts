import { EventSource } from './event-source';

// Types
export interface Event<T extends string = string, D = unknown> {
  // Attributes
  type: T;
  target?: string;
  source: EventSource<Event>;

  data: D;
}

export type ExtractEvent<E extends Event, T extends E['type']> = Extract<E, { type: T }>;

export type EventListener<E extends Event = Event> = (event: E) => void;
