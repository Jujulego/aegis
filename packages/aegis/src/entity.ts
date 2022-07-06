import { Entity, Item, Query, Store } from '@jujulego/aegis-core';

// Types
export type AegisId = string | number | (string | number)[];
export type AegisIdExtractor<A extends unknown[], I extends AegisId> = (...args: A) => I;

export type AegisEntity<T, I extends AegisId = AegisId, P extends Record<string, unknown> = Record<string, unknown>> = P & {
  $entity: Entity<T>;

  $query<N extends string, A extends unknown[]>(name: N, fetcher: (...args: A) => Query<T>): AegisEntity<T, I, P & Record<N, (...args: A) => Query<Item<T>>>>;
  $query<N extends string, A extends unknown[]>(name: N, fetcher: (...args: A) => Query<T>, id: AegisIdExtractor<A, I>): AegisEntity<T, I, P & Record<N, (...args: A) => Item<T>>>;
}

// Entity builder
export function $entity<T, I extends AegisId>(name: string, store: Store, extractor: (itm: T) => I): AegisEntity<T, I> {
  const entity = new Entity<T>(name, store, (itm) => JSON.stringify(extractor(itm)));

  return {
    $entity: entity,

    $query<N extends string, A extends unknown[]>(name: N, fetcher: (...args: A) => Query<T>, id?: AegisIdExtractor<A, I>) {
      this[name] = (...args: A) => {
        if (!id) {
          return entity.query(fetcher(...args));
        } else {
          const item = entity.item(JSON.stringify(id(...args)));
          item.refresh(() => fetcher(...args), 'keep');

          return item;
        }
      };

      return this;
    }
  };
}
