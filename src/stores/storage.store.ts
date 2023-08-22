import { KeyPart } from '@jujulego/event-tree';

import { WeakStore } from '../utils/index.js';

import { Store } from './store.js';

// Repository
export class StorageStore<D, K extends KeyPart = KeyPart> extends Store<D, K> {
  // Attributes
  private readonly _cache = new WeakStore<K, D & object>();

  // Constructor
  constructor(
    readonly storage: Storage,
    readonly prefix: string,
  ) {
    super();
    this._registerWindowEvent();
  }

  // Methods
  private _storageKey(key: K): string {
    return `${this.prefix}:${key}`;
  }

  private _registerWindowEvent() {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === this.storage && event.key) {
        if (!event.key.startsWith(this.prefix)) {
          return;
        }

        // Extract key
        const key = event.key.slice(this.prefix.length + 1) as K;

        if (event.newValue) {
          this.update(key, JSON.parse(event.newValue), { lazy: true });
        }
      }
    });
  }

  protected get(key: K): D | undefined {
    // Use cache
    const cached = this._cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    // Use storage
    const json = this.storage.getItem(this._storageKey(key));
    const data = json === null ? undefined : JSON.parse(json) as D;

    if (data && typeof data === 'object') {
      this._cache.set(key, data);
    }

    return data;
  }

  protected set(key: K, data: D) {
    this.storage.setItem(this._storageKey(key), JSON.stringify(data));
    this._cache.delete(key);
  }
}
