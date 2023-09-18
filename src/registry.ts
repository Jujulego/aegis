import { IListenable, KeyPart, ListenEventRecord, multiplexerMap } from '@jujulego/event-tree';

import { Ref } from './defs/index.js';
import { WeakStore } from './utils/weak-store.js';

// Types
export type RegistryFn<K extends KeyPart, R extends Ref> = (key: K) => R;
export type RegistryEventMap<K extends KeyPart, R extends Ref> = ListenEventRecord<K, R>;

export interface Registry<K extends KeyPart, R extends Ref> extends IListenable<RegistryEventMap<K, R>> {
  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   */
  ref(key: K): R;

  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   * @param lazy if true will not create a reference if none exists
   */
  ref(key: K, lazy: false): R;

  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   * @param lazy if true will not create a reference if none exists
   */
  ref(key: K, lazy: boolean): R | undefined;
}

// Builder
export function registry$<K extends KeyPart, R extends Ref>(fn: RegistryFn<K, R>): Registry<K, R> {
  // Ref management
  const refs = new WeakStore<K, R>();

  function getRef(key: K): R {
    return refs.getOrCreate(key, () => fn(key));
  }

  // Store
  const events = multiplexerMap(getRef);

  return {
    on: events.on,
    off: events.off,
    clear: events.clear,

    ref(key: K, lazy = false) {
      return lazy ? refs.get(key) : getRef(key);
    },
  } as Registry<K, R>;
}
