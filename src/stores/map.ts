import { KeyPart } from '@jujulego/event-tree';

import { SyncMutableRef } from '../defs/index.js';
import { ref$ } from '../refs/index.js';
import { Store, store$ } from './store.js';

// Types
export type MapRef<D> = SyncMutableRef<D | undefined, D>;
export type MapStore<K extends KeyPart, D> = Store<K, D | undefined, D, MapRef<D>>;

// Builder
export function map$<K extends KeyPart, D>(): MapStore<K, D> {
  const map = new Map<K, D>();

  return store$((key: K) => ref$({
    read: () => map.get(key),
    mutate(arg: D): D {
      map.set(key, arg);
      return arg;
    }
  }));
}
