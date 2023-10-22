import { KeyPart } from '@jujulego/event-tree';

import { SyncMutableRef } from '../defs/index.js';
import { ref$ } from '../refs/index.js';
import { Store, store$ } from './store.js';

// Types
export type MemoryRef<D> = SyncMutableRef<D | undefined, D>;
export type MemoryStore<K extends KeyPart, D> = Store<K, D | undefined, D, MemoryRef<D>>;

// Builder
export function memory$<K extends KeyPart, D>(): MemoryStore<K, D> {
  const map = new Map<K, D>();

  return store$((key: K) => ref$({
    read: () => map.get(key),
    mutate(arg: D): D {
      map.set(key, arg);
      return arg;
    }
  }));
}
