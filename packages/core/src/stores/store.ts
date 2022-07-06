import { EventSource } from '../events';

// Types
export interface StoreUpdateEvent<D = unknown> {
  id: string;
  old?: Readonly<D>;
  new: Readonly<D>;
}

export type StoreEventMap<D = unknown> = Record<`update.${string}.${string}`, StoreUpdateEvent<D>>;

// Store
export abstract class Store extends EventSource<StoreEventMap> {
  // Methods
  abstract get<T>(entity: string, id: string): T | undefined;
  abstract set<T>(entity: string, id: string, data: T): T | undefined;
  abstract delete<T>(entity: string, id: string): T | undefined;
}
