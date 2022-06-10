import { AegisStore} from './store';
import { StoreUpdateEvent } from './store-update.event';

// Class
export class AegisStorageStore extends AegisStore {
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
      if (event.storageArea === this.storage && event.key && event.newValue) {
        if (!event.key.startsWith('aegis:')) return;

        this._cache.delete(event.key);
        const [, entity, id] = event.key.split(':');

        this.dispatchEvent(new StoreUpdateEvent(
          entity, id,
          JSON.parse(event.newValue),
          event.oldValue ? JSON.parse(event.oldValue) : undefined
        ));
      }
    });
  }

  get<T>(entity: string, id: string): T | undefined {
    const key = this._key(entity, id);

    // Use cache first
    const cached = this._cache.get(key)?.deref() as T | undefined;

    if (cached !== undefined) {
      return cached;
    }

    // Read from storage
    const data = this.storage.getItem(key) ?? undefined;
    const parsed = data === undefined ? data : JSON.parse(data) as T;

    if (typeof parsed === 'object') {
      this._cache.set(key, new WeakRef(parsed as unknown as object));
    }

    return parsed;
  }

  set<T>(entity: string, id: string, data: T): T | undefined {
    const old = this.get<T>(entity, id);

    this.storage.setItem(this._key(entity, id), JSON.stringify(data));
    this._cache.delete(this._key(entity, id));
    this.dispatchEvent(new StoreUpdateEvent<T>(entity, id, data, old));

    return old;
  }

  delete<T>(entity: string, id: string): T | undefined {
    const old = this.get<T>(entity, id);

    this.storage.removeItem(this._key(entity, id));
    this._cache.delete(this._key(entity, id));

    return old;
  }
}
