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

  get<D>(entity: string, id: string): D | undefined {
    return this._map.get(this._key(entity, id)) as D | undefined;
  }

  set<D>(entity: string, id: string, data: D): D | undefined {
    const old = this.get<D>(entity, id);

    this._map.set(this._key(entity, id), data);
    this.emit(`update.${entity}.${id}`, { id, old, new: data });

    return old;
  }

  delete<D>(entity: string, id: string): D | undefined {
    const old = this.get<D>(entity, id);

    this._map.delete(this._key(entity, id));

    return old;
  }
}
