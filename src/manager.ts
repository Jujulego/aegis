import { IListenable, KeyPart, ListenEventRecord, multiplexerMap } from '@jujulego/event-tree';

import { query$, QueryRef, QueryStrategy } from './refs/index.js';
import { WeakStore } from './utils/weak-store.js';

// Types
export type ManagerEventMap<K extends KeyPart, D> = ListenEventRecord<K, QueryRef<D>>;

export interface Manager<K extends KeyPart, D> extends IListenable<ManagerEventMap<K, D>> {
  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   */
  ref(key: K): QueryRef<D>;

  /**
   * Refreshes the "key" element.
   *
   * @param key
   * @param strategy
   */
  refresh(key: K, strategy: QueryStrategy): QueryRef<D>;
}

// Builder
export function manager$<K extends KeyPart, D>(fetcher: (key: K) => PromiseLike<D>): Manager<K, D> {
  // Ref management
  const refs = new WeakStore<K, QueryRef<D>>();

  function getRef(key: K): QueryRef<D> {
    return refs.getOrCreate(key, () => query$(() => fetcher(key)));
  }

  // Store
  const events = multiplexerMap(getRef);

  return {
    on: events.on,
    off: events.off,
    clear: events.clear,

    ref: getRef,
    refresh(key: K, strategy: QueryStrategy): QueryRef<D> {
      const ref = getRef(key);
      ref.refresh(strategy);

      return ref;
    }
  };
}
