import { KeyPart } from '@jujulego/event-tree';

import { Store, store$ } from './store.js';
import { mutable$, SyncMutableRef } from '../refs/index.js';
import { WeakStore } from '../utils/weak-store.js';

// Types
export type StorageRef<D extends object> = SyncMutableRef<D | undefined, D>;
export type StorageStore<D extends object, K extends KeyPart = KeyPart> = Store<D | undefined, D, K, StorageRef<D>>;

// Builder
export function storage$<D extends object, K extends KeyPart = KeyPart>(storage: Storage, prefix: string): StorageStore<D, K> {
  const cache = new WeakStore<K, D>();

  // Utils
  function storageKey(key: K): string {
    return `${prefix}:${key}`;
  }

  // Store
  const store = store$<D | undefined, D, K, StorageRef<D>>((key: K) => mutable$({
    read(): D | undefined {
      // Use cache
      const cached = cache.get(key);

      if (cached !== undefined) {
        return cached;
      }

      // Use storage
      const json = storage.getItem(storageKey(key));
      const data = json === null ? undefined : JSON.parse(json) as D;

      if (data) {
        cache.set(key, data);
      }

      return data;
    },
    mutate(arg: D): D {
      storage.setItem(storageKey(key), JSON.stringify(arg));
      cache.set(key, arg);

      return arg;
    }
  }));

  // Listen to windows events
  window.addEventListener('storage', (event) => {
    if (event.storageArea === storage && event.key) {
      if (!event.key.startsWith(prefix)) {
        return;
      }

      // Extract key
      const key = event.key.slice(prefix.length + 1) as K;

      if (event.newValue) {
        store.mutate(key, JSON.parse(event.newValue), { lazy: true });
      }
    }
  });

  return store;
}
