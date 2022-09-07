import { Store } from './store';

// Class
/**
 * Stores data within a {@link Storage} object, like {@link localStorage} or {@link sessionStorage}.
 * Listen to window's storage events, so updates from other windows will be propagated here.
 *
 * @see Store
 */
export class StorageStore extends Store {
  // Attributes
  private _cache = new Map<string, WeakRef<object>>();

  // Constructor
  constructor(readonly storage: Storage) {
    super();

    this._registerWindowEvent();
  }

  // Methods
  private _key(entity: string, id: string): string {
    return `aegis:${entity}:${id}`;
  }

  private _registerWindowEvent() {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === this.storage && event.key) {
        if (!event.key.startsWith('aegis:')) {
          return;
        }

        this._cache.delete(event.key);
        const [, entity, id] = event.key.split(':');

        if (!event.newValue) {
          // item has been deleted
          this.emit(`delete.${entity}.${id}`, {
            id,
            item: event.oldValue ? JSON.parse(event.oldValue) : undefined,
          });
        } else {
          // item has been updated
          this.emit(`update.${entity}.${id}`, {
            id,
            old: event.oldValue ? JSON.parse(event.oldValue) : undefined,
            new: JSON.parse(event.newValue)
          });
        }
      }
    });
  }

  get<D>(entity: string, id: string): D | undefined {
    const key = this._key(entity, id);

    // Use cache first
    const cached = this._cache.get(key)?.deref() as D | undefined;

    if (cached !== undefined) {
      return cached;
    }

    // Read from storage
    const data = this.storage.getItem(key) ?? undefined;
    const parsed = data === undefined ? data : JSON.parse(data) as D;

    if (typeof parsed === 'object') {
      this._cache.set(key, new WeakRef(parsed as unknown as object));
    }

    return parsed;
  }

  set<D>(entity: string, id: string, data: D): D | undefined {
    const old = this.get<D>(entity, id);

    this.storage.setItem(this._key(entity, id), JSON.stringify(data));
    this._cache.delete(this._key(entity, id));
    this.emit(`update.${entity}.${id}`, { id, old, new: data });

    return old;
  }

  delete<D>(entity: string, id: string): D | undefined {
    const old = this.get<D>(entity, id);

    this.storage.removeItem(this._key(entity, id));
    this._cache.delete(this._key(entity, id));
    this.emit(`delete.${entity}.${id}`, { id, item: old });

    return old;
  }
}
