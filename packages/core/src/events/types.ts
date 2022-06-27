import { PartialKey, StringKey } from '../utils';

// Types
export type EventMap = Record<string, { data: unknown, filters: (string | number)[] }>;

/**
 * Extract data for given event type
 */
export type EventData<M extends EventMap, T extends keyof M & string> = M[T]['data'];

/**
 * Extract filters for given event type
 */
export type EventFilters<M extends EventMap, T extends keyof M & string> = M[T]['filters'];

/**
 * Build key type for given event type
 */
export type EventKey<M extends EventMap, T extends keyof M & string> = {
  [K in keyof M & string]: [K, ...EventFilters<M, K>]
}[T];

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
export interface EventMetadata<M extends EventMap, T extends keyof M & string> {
  type: T;
  filters: EventFilters<M, T>;
  source: unknown;
}

/**
 * Event listener
 */
export type EventListener<M extends EventMap, T extends keyof M & string> =
  (data: EventData<M, T>, metadata: EventMetadata<M, T>) => void;

export type EventUnsubscribe = () => void;

export interface EventEmitter<M extends EventMap = EventMap> {
  // Emit
  emit<T extends keyof M & string>(
    key: StringKey<EventKey<M, T>>,
    data: EventData<M, T>,
    opts?: EventOptions
  ): void;

  subscribe<T extends keyof M & string>(
    key: StringKey<PartialKey<EventKey<M, T>>>,
    listener: EventListener<M, T>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
}
