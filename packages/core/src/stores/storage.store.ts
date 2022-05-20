import { AegisStore } from './store';

// Class
export class AegisStorageStore implements AegisStore {
  // Constructor
  constructor(readonly storage: Storage) {}

  // Methods
  get<T>(entity: string, id: string): T | undefined {
    const data = localStorage.getItem(`aegis:${entity}:${id}`) || undefined;
    return data && JSON.parse(data);
  }

  set<T>(entity: string, id: string, data: T): void {
    localStorage.setItem(`aegis:${entity}:${id}`, JSON.stringify(data));
  }

  delete<T>(entity: string, id: string): void {
    localStorage.removeItem(`aegis:${entity}:${id}`);
  }
}
