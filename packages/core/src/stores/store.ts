import { TypedEventTarget } from '../event-target';

import { StoreUpdateEvent } from './store-update.event';

// Store
export abstract class AegisStore extends TypedEventTarget<StoreUpdateEvent> {
  // Methods
  abstract get<T>(entity: string, id: string): T | undefined;
  abstract set<T>(entity: string, id: string, data: T): T | undefined;
  abstract delete<T>(entity: string, id: string): T | undefined;
}
