import { Store } from './store';

// Class
/**
 * Stores data within a {@link Map}.
 * @see Store
 */
export class MemoryStore extends Store {
  // Attributes
  private readonly _map = new Map<string, unknown>();

  // Methods
  private _key(entity: string, id: string): string {
    return entity + ':' + id;
  }

  get<T>(entity: string, id: string): T | undefined {
    return this._map.get(this._key(entity, id)) as T | undefined;
  }

  set<T>(entity: string, id: string, data: T): T | undefined {
    const old = this.get<T>(entity, id);

    this._map.set(this._key(entity, id), data);
    this.emit(`update.${entity}.${id}`, { id, old, new: data });

    return old;
  }

  delete<T>(entity: string, id: string): T | undefined {
    const old = this.get<T>(entity, id);

    this._map.delete(this._key(entity, id));

    return old;
  }
}
