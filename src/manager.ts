import { KeyPart } from '@jujulego/event-tree';

import { query$, QueryRef, QueryStrategy } from './refs/index.js';
import { Registry, registry$ } from './registry.js';

// Types
export type ManagerFetcher<K extends KeyPart, D> = (key: K) => PromiseLike<D>;

export interface Manager<K extends KeyPart, D> extends Registry<K, QueryRef<D>> {
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
export function manager$<K extends KeyPart, D>(fetcher: ManagerFetcher<K, D>): Manager<K, D> {
  const registry = registry$<K, QueryRef<D>>((key) => query$(() => fetcher(key)));

  return Object.assign(registry, {
    refresh(key: K, strategy: QueryStrategy): QueryRef<D> {
      const ref = registry.ref(key);
      ref.refresh(strategy);

      return ref;
    }
  });
}
