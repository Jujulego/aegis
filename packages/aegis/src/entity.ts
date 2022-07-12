import { Entity, EntityMerge, Query, RefreshStrategy, Store } from '@jujulego/aegis-core';

import { $item, AegisItem, AegisUnknownItem } from './item';
import { $list, AegisList } from './list';
import { $mutation, AegisMutation, AegisUnknownMutation } from './mutation';
import { $queryfy, AegisId, AegisIdExtractor, AegisProtocol, Fetcher, Refreshable } from './utils';

// Types
interface AegisEntityItem<D, I extends AegisId> {
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
  query<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>): Fetcher<A, AegisUnknownItem<D, I>>;

  /**
   * Query a known item (an item we already know the id)
   * The fetcher and arguments used will be kept for item's refresh method
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   * @param strategy Refresh strategy to use on first load
   */
  query<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>, id: AegisIdExtractor<A, I>, strategy?: RefreshStrategy): Fetcher<A, AegisItem<D, I> & Refreshable<D>>;

  /**
   * Mutates (or creates) an unknown item (an item we don't know the id)
   *
   * @param fetcher
   */
  mutate<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>): Fetcher<A, AegisUnknownMutation<D, D, I>>;

  /**
   * Mutates a known item (an item we already know the id)
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   */
  mutate<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>, id: AegisIdExtractor<A, I>): Fetcher<A, AegisMutation<D, D, I>>;

  /**
   * Mutates a known item (an item we already know the id)
   * The fetcher can return a part of the final object, this result will be merged with stored data
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   * @param merge Function merging query result with stored data
   */
  mutate<A extends unknown[], R>(fetcher: Fetcher<A, PromiseLike<R>>, id: AegisIdExtractor<A, I>, merge: EntityMerge<D, R>): Fetcher<A, AegisMutation<D, D, I>>;

  /**
   * Deletes a known item (an item we already know the id)
   *
   * @param fetcher
   * @param id Function extracting id from fetcher arguments
   */
  delete<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<unknown>>, id: AegisIdExtractor<A, I>): Fetcher<A, AegisMutation<D, D | unknown, I>>;
}

interface AegisEntityList<D> {
  (key: string): AegisList<D>;

  /**
   * Query an item list.
   * Fetcher arguments will be prepended by list's key
   *
   * @param fetcher
   * @param strategy Refresh strategy to use on first load
   */
  query<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D[]>>, strategy?: RefreshStrategy): Fetcher<[string, ...A], AegisList<D> & Refreshable<D[]>>;
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
  function queryItem<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>): Fetcher<A, AegisUnknownItem<D, I>>;
  function queryItem<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>, id: AegisIdExtractor<A, I>, strategy?: RefreshStrategy): Fetcher<A, AegisItem<D, I> & Refreshable<D>>;
  function queryItem<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>, id?: AegisIdExtractor<A, I>, strategy: RefreshStrategy = 'keep') {
    return (...args: A) => {
      if (!id) {
        return $item<D, I>(entity, $queryfy(fetcher(...args)));
      } else {
        const item = $item(entity, id(...args), () => $queryfy(fetcher(...args)));
        item.refresh(strategy);

        return item;
      }
    };
  }

  function mutateItem<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>): Fetcher<A, AegisUnknownMutation<D, D, I>>;
  function mutateItem<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D>>, id: AegisIdExtractor<A, I>): Fetcher<A, AegisMutation<D, D, I>>;
  function mutateItem<A extends unknown[], R>(fetcher: Fetcher<A, PromiseLike<R>>, id: AegisIdExtractor<A, I>, merge: EntityMerge<D, R>): Fetcher<A, AegisMutation<D, D, I>>;
  function mutateItem<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<unknown>>, id?: AegisIdExtractor<A, I>, merge?: EntityMerge<D, unknown>) {
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

  function deleteItem<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<unknown>>, id: AegisIdExtractor<A, I>) {
    return (...args: A) => {
      const _id = id(...args);

      return $mutation(entity, entity.deletion(JSON.stringify(_id), $queryfy(fetcher(...args))), _id);
    };
  }

  // List methods
  function queryList<A extends unknown[]>(fetcher: Fetcher<A, PromiseLike<D[]>>, strategy: RefreshStrategy = 'keep') {
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
