import { AegisEntity, AegisItem } from './entities';
import { AegisStore } from './stores';
import { AegisQuery } from './protocols';

// Type
export type Aegis<T, M> = M & {
  $entity: AegisEntity<T>;
  $get<N extends string>(name: N, sender: (id: string) => AegisQuery<T>): Aegis<T, M & Record<N, (id: string) => AegisItem<T>>>;
}

// Builder
export function $entity<T>(name: string, store: AegisStore): Aegis<T, unknown> {
  return {
    $entity: new AegisEntity<T>(name, store),
    $get<N extends string>(name: N, sender: (id: string) => AegisQuery<T>): Aegis<T, Record<N, (id: string) => AegisItem<T>>> {
      return Object.assign(this, {
        [name]: (id: string) => this.$entity.queryItem(id, sender),
      });
    }
  };
}
