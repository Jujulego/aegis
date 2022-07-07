import {
  Entity,
  EventListener,
  EventListenerOptions, EventSource, EventType,
  EventUnsubscribe, ExtractKey, Item,
  PartialKey, Query, QueryManagerEventMap, RefreshStrategy,
  StoreEventMap
} from '@jujulego/aegis-core';

import { AegisId, Refreshable } from './utils';

// Types
interface AegisItemBase<T> {
  readonly $entity: Entity<T>;

  subscribe(
    key: 'update',
    listener: EventListener<StoreEventMap<T>, `update.${string}.${string}`>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe<T extends PartialKey<EventType<QueryManagerEventMap<T>>>>(
    type: T,
    listener: EventListener<QueryManagerEventMap<T>, ExtractKey<EventType<QueryManagerEventMap<T>>, T>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;

  readonly isLoading: boolean;
  readonly data?: T;
}

export interface AegisItem<T, I extends AegisId = AegisId> extends AegisItemBase<T> {
  readonly $id: I;
  readonly $item: Item<T>;
}

export interface AegisUnknownItem<T, I extends AegisId = AegisId> extends AegisItemBase<T> {
  readonly $id?: I;
  readonly $item?: Item<T>;
}

// Item builder
export function $item<T, I extends AegisId>(entity: Entity<T>, id: I): AegisItem<T, I>;
export function $item<T, I extends AegisId>(entity: Entity<T>, id: I, refresh: () => Query<T>): AegisItem<T, I> & Refreshable<T>;
export function $item<T, I extends AegisId>(entity: Entity<T>, item: Query<Item<T>>): AegisUnknownItem<T, I>;

export function $item<T, I extends AegisId>(entity: Entity<T>, arg1: I | Query<Item<T>>, refresh?: () => Query<T>) {
  if (arg1 instanceof Query) {
    const events = new EventSource<StoreEventMap<T> & QueryManagerEventMap<T>>();

    const item: AegisUnknownItem<T, I> = {
      $entity: entity,

      get subscribe() {
        return events.subscribe.bind(events);
      },

      get isLoading() {
        return this.$item?.isLoading ?? (arg1.status === 'pending');
      },
      get data() {
        return this.$item?.data;
      }
    };

    // Events
    arg1.subscribe('update.failed', (state, mtd) => {
      events.emit('query.failed', state, { source: mtd.source });
    });

    arg1.subscribe('update.completed', ({ result }, mtd) => {
      Object.assign(item, {
        $id: JSON.parse(result.id),
        $item: result
      });

      result.subscribe('update', (data, mtd) => {
        events.emit(mtd.type, data, { source: mtd.source });
      });

      result.subscribe('query', (data, mtd) => {
        events.emit(mtd.type, data, { source: mtd.source });
      });

      events.emit('query.completed', { status: 'completed', result: result.data! }, { source: mtd.source });
    });

    return item;
  } else {
    const item: AegisItem<T, I> = {
      $id: arg1,
      $item: entity.item(JSON.stringify(arg1)),
      $entity: entity,

      get subscribe() {
        return this.$item.subscribe.bind(this.$item);
      },

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
