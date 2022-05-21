import { AegisStore, StoreUpdateEvent } from './store';

// Class
export class AegisStorageStore extends AegisStore {
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
    const data = this.storage.getItem(this._key(entity, id)) || undefined;
    return data && JSON.parse(data);
  }

  set<T>(entity: string, id: string, data: T): T | undefined {
    const old = this.get<T>(entity, id);

    this.storage.setItem(this._key(entity, id), JSON.stringify(data));
    this.dispatchEvent(new StoreUpdateEvent<T>(entity, id, data, old));

    return old;
  }

  delete<T>(entity: string, id: string): T | undefined {
    const old = this.get<T>(entity, id);

    this.storage.removeItem(this._key(entity, id));

    return old;
  }
}
