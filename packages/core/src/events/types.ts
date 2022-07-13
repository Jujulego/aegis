import { ExtractKey, PartialKey } from '../utils';

// Types
export type EventMap = Record<string, unknown>;

/**
 * Build key type for given event type
 */
export type EventType<M extends EventMap> = keyof M & string;

/**
 * Extract data for given event type
 */
export type EventData<M extends EventMap, T extends EventType<M> = EventType<M>> = M[T];

/**
 * Event emit options
 */
export interface EventOptions {
  source?: unknown;
}

/**
 * Event listener options
 */
export interface EventListenerOptions {
  signal?: AbortSignal;
}

/**
 * Event metadata
 */
export interface EventMetadata<M extends EventMap, T extends EventType<M> = EventType<M>> {
  type: T;
  source: unknown;
}

/**
 * Event listener
 */
export type EventListener<M extends EventMap, T extends EventType<M> = EventType<M>> =
  (data: EventData<M, T>, metadata: EventMetadata<M, T>) => void;

export type EventUnsubscribe = () => void;

export type EventPromise<M extends EventMap, T extends EventType<M> = EventType<M>> =
  Promise<[data: EventData<M, T>, metadata: EventMetadata<M, T>]>;

export interface EventEmitter<M extends EventMap = EventMap> {
  // Emit
  emit<T extends EventType<M>>(
    type: T,
    data: EventData<M, T>,
    opts?: EventOptions
  ): void;

  subscribe<T extends PartialKey<EventType<M>>>(
    type: T,
    listener: EventListener<M, ExtractKey<EventType<M>, T>>,
    opts?: EventListenerOptions,
  ): EventUnsubscribe;
}
