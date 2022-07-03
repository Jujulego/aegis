import { AegisQuery } from '../protocols';
import { AegisStore } from '../stores';

import { AegisItem } from './item';
import { AegisList } from './list';

import { AegisEntity, EntityIdExtractor, EntityMerge } from './entity';

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
  $get<N extends string, A extends [{ id: string }, ...unknown[]]>(name: N, sender: (...args: A) => AegisQuery<T>): Aegis<T, M & Record<N, (...args: A) => AegisItem<T>>>;

  /**
   * Add a query to the entity.
   * This query should return an item. To use when you don't know the id of the queried item
   *
   * @param name
   * @param sender
   */
  $query<N extends string, A extends unknown[] = []>(name: N, sender: (...args: A) => AegisQuery<T>): Aegis<T, Record<N, (...args: A) => AegisQuery<AegisItem<T>>>>;

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
  $update<N extends string, R, I extends string = string, A extends unknown[] = []>(name: N, sender: (id: I, ...args: A) => AegisQuery<R>, merge: EntityMerge<T, R>): Aegis<T, Record<N, (id: I, ...args: A) => AegisQuery<T>>>;

  /**
   * Add a delete query to the entity.
   * This query should delete the item by id, result is ignored.
   *
   * @param name
   * @param sender
   */
  $delete<N extends string, I extends string = string>(name: N, sender: (id: I) => AegisQuery<unknown>): Aegis<T, Record<N, (id: I) => AegisQuery<T | undefined>>>;
}

// Entity builder
export function $entity<T>(name: string, store: AegisStore, extractor: EntityIdExtractor<T>): Aegis<T, unknown> {
  return {
    $entity: new AegisEntity<T>(name, store, extractor),

    $get<N extends string, A extends [{ id: string }, ...unknown[]]>(this: Aegis<T, unknown>, name: N, sender: (...args: A) => AegisQuery<T>) {
      return Object.assign(this, {
        [name]: (...args: A) => {
          const item = this.$entity.item(args[0].id);
          item.refresh(() => sender(...args), 'keep');

          return item;
        },
      }) as Aegis<T, Record<N, (...args: A) => AegisItem<T>>>;
    },

    $query<N extends string, A extends unknown[] = []>(this: Aegis<T, unknown>, name: N, sender: (...args: A) => AegisQuery<T>) {
      return Object.assign(this, {
        [name]: (...args: A) => this.$entity.query(sender(...args)),
      }) as Aegis<T, Record<N, (...args: A) => AegisQuery<AegisItem<T>>>>;
    },

    $list<N extends string, A extends unknown[] = []>(this: Aegis<T, unknown>, name: N, sender: (...args: A) => AegisQuery<T[]>) {
      return Object.assign(this, {
        [name]: (key: string, ...args: A) => {
          const list = this.$entity.list(key);
          list.refresh(() => sender(...args), 'replace');

          return list;
        },
      }) as Aegis<T, Record<N, (key: string, ...args: A) => AegisList<T>>>;
    },

    $create<N extends string, A extends unknown[] = []>(this: Aegis<T, unknown>, name: N, sender: (...args: A) => AegisQuery<T>) {
      return Object.assign(this, {
        [name]: (...args: A) => this.$entity.query(sender(...args)),
      }) as Aegis<T, Record<N, (...args: A) => AegisQuery<AegisItem<T>>>>;
    },

    $update<N extends string, I extends string = string, A extends unknown[] = []>(this: Aegis<T, unknown>, name: N, sender: (id: I, ...args: A) => AegisQuery<unknown>, merge?: EntityMerge<T, unknown>) {
      return Object.assign(this, {
        [name]: (id: I, ...args: A) => {
          if (merge) {
            return this.$entity.mutation(id, sender(id, ...args), merge);
          } else {
            return this.$entity.mutation(id, sender(id, ...args) as AegisQuery<T>);
          }
        },
      }) as Aegis<T, Record<N, (id: I, ...args: A) => AegisQuery<T>>>;
    },

    $delete<N extends string, I extends string = string>(name: N, sender: (id: I) => AegisQuery<unknown>) {
      return Object.assign(this, {
        [name]: (id: I) => this.$entity.deletion(id, sender(id)),
      }) as Aegis<T, Record<N, (id: I) => AegisQuery<T | undefined>>>;
    },
  };
}
