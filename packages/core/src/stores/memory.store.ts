import { AegisStore } from './store';

// Class
export class AegisMemoryStore implements AegisStore {
  // Attributes
  private readonly _map = new Map<string, unknown>();

  // Methods
  get<T>(entity: string, id: string): T | undefined {
    return this._map.get(entity + ':' + id) as T | undefined;
  }

  set<T>(entity: string, id: string, data: T): void {
    this._map.set(entity + ':' + id, data);
  }

  delete<T>(entity: string, id: string): void {
    this._map.delete(entity + ':' + id);
  }
}
