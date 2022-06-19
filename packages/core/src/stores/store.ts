import { EventSource, UpdateEvent } from '../events';

// Store
export abstract class AegisStore extends EventSource<UpdateEvent> {
  // Methods
  abstract get<T>(entity: string, id: string): T | undefined;
  abstract set<T>(entity: string, id: string, data: T): T | undefined;
  abstract delete<T>(entity: string, id: string): T | undefined;
}
