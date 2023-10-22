import { KeyPart } from '@jujulego/event-tree';

import { SyncMutableRef } from '../defs/index.js';
import { ref$ } from '../refs/index.js';
import { WeakStore } from '../utils/weak-store.js';
import { Store, store$ } from './store.js';

// Types
export type StorageRef<D> = SyncMutableRef<D | undefined, D>;
export type StorageStore<K extends KeyPart, D> = Store<K, D | undefined, D, StorageRef<D>>;

// Builder
export function storage$<K extends KeyPart, D>(storage: Storage, prefix: string): StorageStore<K, D> {
  const cache = new WeakStore<K, D & object>();

  // Utils
  function storageKey(key: K): string {
    return `${prefix}:${key}`;
  }

  // Store
  const store: StorageStore<K, D> = store$((key: K) => ref$({
    read(): D | undefined {
      // Use cache
      const cached = cache.get(key);

      if (cached !== undefined) {
        return cached;
      }

      // Use storage
      const json = storage.getItem(storageKey(key));
      const data = json === null ? undefined : JSON.parse(json) as D;

      if (data && typeof data === 'object') {
        cache.set(key, data);
      }

      return data;
    },
    mutate(data: D): D {
      storage.setItem(storageKey(key), JSON.stringify(data));

      if (data && typeof data === 'object') {
        cache.set(key, data);
      }

      return data;
    }
  }));

  // Listen to window events
  window.addEventListener('storage', (event) => {
    if (event.storageArea === storage && event.key) {
      if (!event.key.startsWith(prefix)) {
        return;
      }

      // Extract key
      const key = event.key.slice(prefix.length + 1) as K;

      if (event.newValue) {
        const data = JSON.parse(event.newValue);

        cache.set(key, data);
        store.trigger(key, data);
      }
    }
  });

  return store;
}
