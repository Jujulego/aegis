import { EventSource } from '../events';

import { StoreUpdateEvent } from './store-update.event';

// Store
export abstract class AegisStore extends EventSource<StoreUpdateEvent> {
  // Methods
  abstract get<T>(entity: string, id: string): T | undefined;
  abstract set<T>(entity: string, id: string, data: T): T | undefined;
  abstract delete<T>(entity: string, id: string): T | undefined;
}
