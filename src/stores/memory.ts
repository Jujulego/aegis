import { KeyPart } from '@jujulego/event-tree';

import { mutable$, SyncMutableRef } from '../refs/index.js';
import { Store, store$ } from './store.js';

// Types
export type MemoryRef<D> = SyncMutableRef<D | undefined, D>;
export type MemoryStore<D, K extends KeyPart = KeyPart> = Store<D | undefined, D, K, MemoryRef<D>>;

// Builder
export function memory$<D, K extends KeyPart = KeyPart>(): MemoryStore<D, K> {
  const map = new Map<K, D>();

  return store$((key: K) => mutable$({
    read: () => map.get(key),
    mutate(arg: D): D {
      map.set(key, arg);
      return arg;
    }
  }));
}
