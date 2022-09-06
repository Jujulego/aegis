import { Entity, EntityMerge, Query, RefreshStrategy, Store } from '@jujulego/aegis-core';

import { $queryfy, AegisId, AegisIdExtractor, AegisProtocol, Refreshable } from './utils';
import {
  $item, $list,
  $mutation,
  AegisItem,
  AegisList,
  AegisMutation,
  AegisUnknownItem,
  AegisUnknownMutation
} from './wrappers';

// Types
export type AegisRefresh = 'always' | 'if-unknown' | 'never';

export interface AegisOptions {
  /**
   * Indicates if aegis should refresh function call.
   * Accepted values:
   * - 'never': never refresh
   * - 'if-unknown': refresh only if data is unknown (=> not in store)
   * - 'always': always refresh
   *
   * This only affects method call, not further .refresh() calls
   *
   * @default if-unknown
   */
  refresh?: AegisRefresh;

  /**
   * Strategy to use when refreshing while a request is already running
   * Accepted values:
   * - 'keep': keeps running query, and do not start a new one
   * - 'replace': cancel running query, and start a new one
   *
   * @default keep
   */
  strategy?: RefreshStrategy;
}

export interface AegisEntityItem<D, I extends AegisId> {
  /**
   * Returns an AegisItem by item's id
   *
   * @param id
   */
  (id: I): AegisItem<D, I>;

  /**
   * Query (or creates) an unknown item (an item we don't know the id)
   *
   * @param fetcher
   */
  query<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>): (...args: A) => AegisUnknownItem<D, I>;

  /**
   * Query a known item (an item we already know the id)
   * The fetcher and arguments used will be kept for item's refresh method
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   * @param options
   */
  query<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>, id: AegisIdExtractor<A, I>, options?: AegisOptions): (...args: A) => AegisItem<D, I> & Refreshable<D>;

  /**
   * Mutates (or creates) an unknown item (an item we don't know the id)
   *
   * @param fetcher
   */
  mutate<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>): (...args: A) => AegisUnknownMutation<D, D, I>;

  /**
   * Mutates a known item (an item we already know the id)
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   */
  mutate<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>, id: AegisIdExtractor<A, I>): (...args: A) => AegisMutation<D, D, I>;

  /**
   * Mutates a known item (an item we already know the id)
   * The fetcher can return a part of the final object, this result will be merged with stored data
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   * @param merge Function merging query result with stored data
   */
  mutate<A extends unknown[], R>(fetcher: (...args: A) => PromiseLike<R>, id: AegisIdExtractor<A, I>, merge: EntityMerge<D, R>): (...args: A) => AegisMutation<D, D, I>;

  /**
   * Deletes a known item (an item we already know the id)
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   */
  delete<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<unknown>, id: AegisIdExtractor<A, I>): (...args: A) => AegisMutation<D, D | unknown, I>;
}

export interface AegisEntityList<D> {
  (key: string): AegisList<D>;

  /**
   * Query an item list.
   * Fetcher arguments will be prepended by list's key
   *
   * @param fetcher
   * @param options
   */
  query<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D[]>, options?: AegisOptions): (key: string, ...args: A) => AegisList<D> & Refreshable<D[]>;
}

export interface AegisEntity<D, I extends AegisId> {
  /**
   * Inner entity object
   */
  readonly $entity: Entity<D>;
  readonly $item: AegisEntityItem<D, I>;
  readonly $list: AegisEntityList<D>;

  $protocol<P extends AegisProtocol>(builder: (entity: AegisEntity<D, I>) => P): AegisEntity<D, I> & P;
}

// Entity builder
export function $entity<D, I extends AegisId>(name: string, store: Store, extractor: (itm: D) => I): AegisEntity<D, I> {
  // Inner entity
  const entity = new Entity<D>(name, store, (itm: D) => JSON.stringify(extractor(itm)));

  // Item methods
  function queryItem<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>): (...args: A) => AegisUnknownItem<D, I>;
  function queryItem<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>, id: AegisIdExtractor<A, I>, options?: AegisOptions): (...args: A) => AegisItem<D, I> & Refreshable<D>;
  function queryItem<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>, id?: AegisIdExtractor<A, I>, options: AegisOptions = {}) {
    const { refresh = 'if-unknown', strategy = 'keep' } = options;

    return (...args: A) => {
      if (!id) {
        return $item<D, I>(entity, $queryfy(fetcher(...args)));
      } else {
        const item = $item(entity, id(...args), () => $queryfy(fetcher(...args)));

        if (refresh === 'always' || (refresh === 'if-unknown' && item.data === undefined)) {
          item.refresh(strategy);
        }

        return item;
      }
    };
  }

  function mutateItem<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>): (...args: A) => AegisUnknownMutation<D, D, I>;
  function mutateItem<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D>, id: AegisIdExtractor<A, I>): (...args: A) => AegisMutation<D, D, I>;
  function mutateItem<A extends unknown[], R>(fetcher: (...args: A) => PromiseLike<R>, id: AegisIdExtractor<A, I>, merge: EntityMerge<D, R>): (...args: A) => AegisMutation<D, D, I>;
  function mutateItem<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<unknown>, id?: AegisIdExtractor<A, I>, merge?: EntityMerge<D, unknown>) {
    return (...args: A) => {
      const query = $queryfy(fetcher(...args));

      if (!id) {
        return $mutation<D, I>(entity, query as Query<D>);
      }

      const _id = id(...args);

      if (!merge) {
        return $mutation(entity, entity.mutation(JSON.stringify(_id), query as Query<D>), _id);
      }

      return $mutation(entity, entity.mutation(JSON.stringify(_id), query, merge), _id);
    };
  }

  function deleteItem<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<unknown>, id: AegisIdExtractor<A, I>) {
    return (...args: A) => {
      const _id = id(...args);

      return $mutation(entity, entity.deletion(JSON.stringify(_id), $queryfy(fetcher(...args))), _id);
    };
  }

  // List methods
  function queryList<A extends unknown[]>(fetcher: (...args: A) => PromiseLike<D[]>, options: AegisOptions = {}) {
    const { refresh = 'if-unknown', strategy = 'keep' } = options;

    return (key: string, ...args: A) => {
      const list = $list(entity, key, () => $queryfy(fetcher(...args)));
      list.$list.refresh(() => $queryfy(fetcher(...args)), strategy);

      return list;
    };
  }

  // Final object
  return {
    $entity: entity,

    $item: Object.assign((id: I): AegisItem<D, I> => $item(entity, id), {
      query: queryItem,
      mutate: mutateItem,
      delete: deleteItem,
    }),

    $list: Object.assign((key: string): AegisList<D> => $list(entity, key), {
      query: queryList,
    }),

    $protocol<P extends AegisProtocol>(this: AegisEntity<D, I>, builder: (entity: AegisEntity<D, I>) => P) {
      return Object.assign(this, builder(this));
    }
  };
}
