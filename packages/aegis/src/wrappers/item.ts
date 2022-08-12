import {
  Entity,
  EventListener,
  EventListenerOptions, EventSource, EventType,
  EventUnsubscribe, ExtractKey, Item,
  PartialKey, Query, QueryManagerEventMap, RefreshStrategy,
  StoreEventMap
} from '@jujulego/aegis-core';

import { AegisId, Refreshable } from '../utils';

// Types
export interface AegisUnknownItem<D, I extends AegisId = AegisId> extends PromiseLike<D> {
  readonly $id?: I;
  readonly $item?: Item<D>;
  readonly $entity: Entity<D>;

  readonly isLoading: boolean;
  data?: D;

  subscribe(
    key: 'update',
    listener: EventListener<StoreEventMap<D>, `update.${string}.${string}`>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe<T extends PartialKey<EventType<QueryManagerEventMap<D>>>>(
    type: T,
    listener: EventListener<QueryManagerEventMap<D>, ExtractKey<EventType<QueryManagerEventMap<D>>, T>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
}

export interface AegisItem<D, I extends AegisId = AegisId> extends AegisUnknownItem<D, I> {
  readonly $id: I;
  readonly $item: Item<D>;
}

// Item builder
export function $item<D, I extends AegisId>(entity: Entity<D>, id: I): AegisItem<D, I>;
export function $item<D, I extends AegisId>(entity: Entity<D>, id: I, refresh: () => Query<D>): AegisItem<D, I> & Refreshable<D>;
export function $item<D, I extends AegisId>(entity: Entity<D>, query: Query<D>): AegisUnknownItem<D, I>;

export function $item<D, I extends AegisId>(entity: Entity<D>, arg1: I | Query<D>, refresh?: () => Query<D>) {
  if (arg1 instanceof Query) {
    const events = new EventSource<StoreEventMap<D> & QueryManagerEventMap<D>>();

    const item: AegisUnknownItem<D, I> = {
      $entity: entity,

      subscribe: events.subscribe.bind(events),
      then<R1 = D, R2 = never>(
        this: AegisUnknownItem<D, I>,
        onfulfilled?: ((value: D) => (PromiseLike<R1> | R1)) | undefined | null,
        onrejected?: ((reason: Error) => (PromiseLike<R2> | R2)) | undefined | null
      ): PromiseLike<R1 | R2> {
        return (this.$item?.query ?? arg1).then(onfulfilled, onrejected);
      },

      get isLoading() {
        return this.$item?.isLoading ?? (arg1.status === 'pending');
      },

      get data() {
        return this.$item?.data;
      },
      set data(value: D | undefined) {
        if (!this.$item) {
          throw new Error('Cannot update unknown item');
        }

        this.$item.data = value;
      }
    };

    // Events
    arg1.subscribe('status.failed', (state, mtd) => {
      events.emit('status.failed', state, { source: mtd.source });
    });

    arg1.subscribe('status.completed', ({ result }, mtd) => {
      const id = entity.storeItem(result);
      const $item = entity.item(id);

      Object.assign(item, {
        $id: JSON.parse(id),
        $item
      });

      $item.subscribe('update', (data, mtd) => {
        events.emit(mtd.type, data, { source: mtd.source });
      });

      $item.subscribe('status', (data, mtd) => {
        events.emit(mtd.type, data, { source: mtd.source });
      });

      events.emit('status.completed', { status: 'completed', result: result }, { source: mtd.source });
    });

    return item;
  } else {
    const $item = entity.item(JSON.stringify(arg1));

    const item: AegisItem<D, I> = {
      $id: arg1,
      $item,
      $entity: entity,

      subscribe: $item.subscribe.bind($item),
      then<R1 = D, R2 = never>(
        onfulfilled?: ((value: D) => (PromiseLike<R1> | R1)) | undefined | null,
        onrejected?: ((reason: Error) => (PromiseLike<R2> | R2)) | undefined | null
      ): PromiseLike<R1 | R2> {
        if (!$item.isLoading && $item.data) {
          return Promise.resolve($item.data).then(onfulfilled, onrejected);
        }

        return $item.manager.nextResult()
          .then(onfulfilled, onrejected);
      },

      get isLoading() {
        return $item.isLoading;
      },

      get data() {
        return $item.data;
      },
      set data(value: D | undefined) {
        $item.data = value;
      }
    };

    if (refresh) {
      return Object.assign(item, {
        refresh(strategy: RefreshStrategy = 'keep') {
          return $item.refresh(refresh, strategy);
        }
      });
    }

    return item;
  }
}
