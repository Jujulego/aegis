import { AegisStore } from '../stores';
import { AegisQuery } from '../protocols';

import { AegisEntity, EntityIdExtractor, EntityMerge } from './entity';
import { AegisItem } from './item';
import { AegisList } from './list';

// Type
export type Aegis<T, M> = M & {
  $entity: AegisEntity<T>;

  /**
   * Add a get query to the entity.
   * This query should return an item by it's id.
   *
   * @param name
   * @param sender
   */
  $get<N extends string, I extends string = string>(name: N, sender: (id: I) => AegisQuery<T>): Aegis<T, M & Record<N, (id: I) => AegisItem<T>>>;

  /**
   * Add a list query to the entity.
   * This query should return an array of items.
   *
   * @param name
   * @param sender
   */
  $list<N extends string, A extends unknown[] = []>(name: N, sender: (...args: A) => AegisQuery<T[]>): Aegis<T, M & Record<N, (key: string, ...args: A) => AegisList<T>>>;

  /**
   * Add a create query to the entity.
   * This query should create a new item and then return it.
   *
   * @param name
   * @param sender
   */
  $create<N extends string, A extends unknown[] = []>(name: N, sender: (...args: A) => AegisQuery<T>): Aegis<T, Record<N, (...args: A) => AegisQuery<AegisItem<T>>>>;

  /**
   * Add an update query to the entity.
   * This query should apply the mutation to the item and return the modified item.
   *
   * @param name
   * @param sender
   */
  $update<N extends string, I extends string = string, A extends unknown[] = []>(name: N, sender: (id: I, ...args: A) => AegisQuery<T>): Aegis<T, Record<N, (id: I, ...args: A) => AegisQuery<T>>>;

  /**
   * Add an update query to the entity.
   * This query should apply the mutation to the item, the result will be merged with existing cached data.
   *
   * @param name
   * @param sender
   * @param merge used to merge result with cached data if any
   */
  $update<N extends string, R, I extends string = string, A extends unknown[] = []>(name: N, sender: (id: I, ...args: A) => AegisQuery<R>, merge: EntityMerge<T, R>): Aegis<T, Record<N, (id: I, ...args: A) => AegisQuery<R>>>;
}

// Entity builder
export function $entity<T>(name: string, store: AegisStore, extractor: EntityIdExtractor<T>): Aegis<T, unknown> {
  return {
    $entity: new AegisEntity<T>(name, store, extractor),

    $get<N extends string, I extends string = string>(name: N, sender: (id: I) => AegisQuery<T>): Aegis<T, Record<N, (id: I) => AegisItem<T>>> {
      return Object.assign(this, {
        [name]: (id: I) => this.$entity.queryItem(id, sender),
      });
    },

    $list<N extends string, A extends unknown[] = []>(name: N, sender: (...args: A) => AegisQuery<T[]>): Aegis<T, Record<N, (key: string, ...args: A) => AegisList<T>>> {
      return Object.assign(this, {
        [name]: (key: string, ...args: A) => this.$entity.queryList(key, () => sender(...args)),
      });
    },

    $create<N extends string, A extends unknown[] = []>(name: N, sender: (...args: A) => AegisQuery<T>): Aegis<T, Record<N, (...args: A) => AegisQuery<AegisItem<T>>>> {
      return Object.assign(this, {
        [name]: (...args: A) => this.$entity.createItem(sender(...args)),
      });
    },

    $update<N extends string, R = T, I extends string = string, A extends unknown[] = []>(name: N, sender: (id: I, ...args: A) => AegisQuery<R>, merge?: EntityMerge<T, R>): Aegis<T, Record<N, (id: I, ...args: A) => AegisQuery<R>>> {
      return Object.assign(this, {
        [name]: (id: I, ...args: A) => {
          const query = sender(id, ...args);
          this.$entity.updateItem(id, query, merge ?? ((_: T, result: T) => result));

          return query;
        },
      });
    },
  };
}
