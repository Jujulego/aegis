import { AegisStore } from '../stores';
import { AegisQuery } from '../protocols';

import { AegisEntity, EntityIdExtractor, EntityMerge } from './entity';
import { AegisItem } from './item';
import { AegisList } from './list';

// Type
export type Aegis<T, M> = M & {
  $entity: AegisEntity<T>;
  $get<N extends string, I extends string = string>(name: N, sender: (id: I) => AegisQuery<T>): Aegis<T, M & Record<N, (id: I) => AegisItem<T>>>;
  $list<N extends string, A extends unknown[] = []>(name: N, sender: (...args: A) => AegisQuery<T[]>): Aegis<T, M & Record<N, (key: string, ...args: A) => AegisList<T>>>;
  $update<N extends string, I extends string = string, A extends unknown[] = []>(name: N, sender: (id: I, ...args: A) => AegisQuery<T>): Aegis<T, Record<N, (id: I, ...args: A) => AegisQuery<T>>>;
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
