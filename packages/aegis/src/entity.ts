import { Entity, EntityMerge, Query, RefreshStrategy, Store } from '@jujulego/aegis-core';

import { $item, AegisItem, AegisUnknownItem } from './item';
import { $list, AegisList } from './list';
import { $mutation, AegisMutation, AegisUnknownMutation } from './mutation';
import { AegisId, AegisIdExtractor, AegisProtocol, Fetcher, Refreshable } from './utils';

// Types
export type AegisEntity<D, I extends AegisId, P extends AegisProtocol> = P & {
  readonly $entity: Entity<D>;

  $item(id: I): AegisItem<D, I>;
  $queryItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<D>>): AegisEntity<D, I, P & Record<N, Fetcher<A, AegisUnknownItem<D, I>>>>;
  $queryItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<D>>, id: AegisIdExtractor<A, I>, strategy?: RefreshStrategy): AegisEntity<D, I, P & Record<N, Fetcher<A, AegisItem<D, I> & Refreshable<D>>>>;
  $mutateItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<D>>): AegisEntity<D, I, P & Record<N, Fetcher<A, AegisUnknownMutation<D>>>>;
  $mutateItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<D>>, id: AegisIdExtractor<A, I>): AegisEntity<D, I, P & Record<N, Fetcher<A, AegisMutation<D>>>>;
  $mutateItem<N extends string, A extends unknown[], R>(name: N, fetcher: Fetcher<A, Query<R>>, id: AegisIdExtractor<A, I>, merge: EntityMerge<D, R>): AegisEntity<D, I, P & Record<N, Fetcher<A, AegisMutation<D>>>>;
  $deleteItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<unknown>>, id: AegisIdExtractor<A, I>): AegisEntity<D, I, P & Record<N, Fetcher<A, AegisMutation<D>>>>;

  $list(key: string): AegisList<D>;
  $queryList<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<D[]>>, strategy?: RefreshStrategy): AegisEntity<D, I, P & Record<N, Fetcher<[string, ...A], AegisList<D>>>>;
}

// Entity builder
// eslint-disable-next-line @typescript-eslint/ban-types
export function $entity<T, I extends AegisId>(name: string, store: Store, extractor: (itm: T) => I): AegisEntity<T, I, {}> {
  const entity = new Entity<T>(name, store, (itm: T) => JSON.stringify(extractor(itm)));

  return {
    $entity: entity,

    $item(id: I): AegisItem<T, I> {
      return $item(entity, id);
    },

    $queryItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<T>>, id?: AegisIdExtractor<A, I>, strategy: RefreshStrategy = 'keep') {
      this[name] = (...args: A) => {
        if (!id) {
          return $item<T, I>(entity, fetcher(...args));
        } else {
          const item = $item(entity, id(...args), () => fetcher(...args));
          item.$item.refresh(() => fetcher(...args), strategy);

          return item;
        }
      };

      return this;
    },

    $mutateItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<unknown>>, id?: AegisIdExtractor<A, I>, merge?: EntityMerge<T, unknown>) {
      this[name] = (...args: A) => {
        const query = fetcher(...args);

        if (!id) {
          return $mutation(entity, query as Query<T>);
        }

        const _id = id(...args);

        if (!merge) {
          return $mutation(entity, entity.mutation(JSON.stringify(_id), query as Query<T>), _id);
        }

        return $mutation(entity, entity.mutation(JSON.stringify(_id), query, merge), _id);
      };

      return this;
    },


    $deleteItem<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<unknown>>, id: AegisIdExtractor<A, I>) {
      this[name] = (...args: A) => {
        const _id = id(...args);
        return $mutation(entity, entity.deletion(JSON.stringify(_id), fetcher(...args)), _id);
      };

      return this;
    },

    $list(key: string): AegisList<T> {
      return $list(entity, key);
    },

    $queryList<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<T[]>>, strategy: RefreshStrategy = 'keep') {
      this[name] = (key: string, ...args: A) => {
        const list = $list(entity, key, () => fetcher(...args));
        list.$list.refresh(() => fetcher(...args), strategy);

        return list;
      };

      return this;
    }
  };
}
