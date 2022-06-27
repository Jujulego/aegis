import { EventSource } from '../events';

// Types
export interface StoreUpdateEvent<D = unknown> {
  id: string;
  old?: Readonly<D>;
  new: Readonly<D>;
}

export type StoreEventMap<D = unknown> = {
  update: { data: StoreUpdateEvent<D>, filters: [string, string] }
}

// Store
export abstract class AegisStore extends EventSource<StoreEventMap> {
  // Methods
  abstract get<T>(entity: string, id: string): T | undefined;
  abstract set<T>(entity: string, id: string, data: T): T | undefined;
  abstract delete<T>(entity: string, id: string): T | undefined;
}
