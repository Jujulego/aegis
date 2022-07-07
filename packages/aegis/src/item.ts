import { Entity, Item, Query, RefreshStrategy } from '@jujulego/aegis-core';

import { AegisId, Refreshable } from './utils';

// Types
export interface AegisItem<T, I extends AegisId = AegisId> {
  readonly $id: I;
  readonly $item: Item<T>;
  readonly $entity: Entity<T>;

  readonly isLoading: boolean;
  readonly data?: T;
}

export interface AegisUnknownItem<T, I extends AegisId = AegisId> {
  readonly $id?: I;
  readonly $item?: Item<T>;
  readonly $entity: Entity<T>;

  readonly isLoading: boolean;
  readonly data?: T;
}

// Item builder
export function $item<T, I extends AegisId>(entity: Entity<T>, id: I): AegisItem<T, I>;
export function $item<T, I extends AegisId>(entity: Entity<T>, id: I, refresh: () => Query<T>): AegisItem<T, I> & Refreshable<T>;
export function $item<T, I extends AegisId>(entity: Entity<T>, item: Query<Item<T>>): AegisUnknownItem<T, I>;

export function $item<T, I extends AegisId>(entity: Entity<T>, arg1: I | Query<Item<T>>, refresh?: () => Query<T>) {
  if (arg1 instanceof Query) {
    const item: AegisUnknownItem<T, I> = {
      $entity: entity,

      get isLoading() {
        return this.$item?.isLoading ?? (arg1.status === 'pending');
      },
      get data() {
        return this.$item?.data;
      }
    };

    arg1.subscribe('update.completed', (result) => {
      Object.assign(item, {
        $id: JSON.parse(result.result.id),
        $item: result.result
      });
    });

    return item;
  } else {
    const item: AegisItem<T, I> = {
      $id: arg1,
      $item: entity.item(JSON.stringify(arg1)),
      $entity: entity,

      get isLoading() {
        return this.$item.isLoading;
      },
      get data() {
        return this.$item.data;
      }
    };

    if (refresh) {
      return Object.assign(item, {
        refresh(strategy: RefreshStrategy = 'keep') {
          return item.$item.refresh(refresh, strategy);
        }
      });
    }

    return item;
  }
}
