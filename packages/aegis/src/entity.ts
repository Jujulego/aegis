import { Entity, Query, RefreshStrategy, Store } from '@jujulego/aegis-core';

import { $item, AegisItem, AegisUnknownItem } from './item';
import { AegisId, AegisIdExtractor, AegisProtocol, Fetcher, Refreshable } from './utils';

// Types
export type AegisEntity<T, I extends AegisId, P extends AegisProtocol> = P & {
  readonly $entity: Entity<T>;

  $item(id: I): AegisItem<T>;

  $query<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<T>>): AegisEntity<T, I, P & Record<N, Fetcher<A, AegisUnknownItem<T, I>>>>;
  $query<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<T>>, id: AegisIdExtractor<A, I>, strategy?: RefreshStrategy): AegisEntity<T, I, P & Record<N, Fetcher<A, AegisItem<T, I> & Refreshable<T>>>>;
}

// Entity builder
// eslint-disable-next-line @typescript-eslint/ban-types
export function $entity<T, I extends AegisId>(name: string, store: Store, extractor: (itm: T) => I): AegisEntity<T, I, {}> {
  const entity = new Entity<T>(name, store, (itm) => JSON.stringify(extractor(itm)));

  return {
    $entity: entity,

    $item(id: I): AegisItem<T> {
      return $item(entity, id);
    },

    $query<N extends string, A extends unknown[]>(name: N, fetcher: Fetcher<A, Query<T>>, id?: AegisIdExtractor<A, I>, strategy: RefreshStrategy = 'keep') {
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
    }
  };
}
