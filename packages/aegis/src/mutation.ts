import {
  Entity,
  EventListener,
  EventListenerOptions, EventType,
  EventUnsubscribe, ExtractKey,
  PartialKey, Query, QueryEventMap
} from '@jujulego/aegis-core';

import { $item, AegisItem, AegisUnknownItem } from './item';
import { AegisId } from './utils';

// Types
export interface AegisUnknownMutation<D, R = D, I extends AegisId = AegisId> {
  readonly $id?: I;
  readonly $query: Query<R>;
  readonly $entity: Entity<D>;

  readonly item?: AegisUnknownItem<D, I>;
  readonly isLoading: boolean;
  readonly result?: R;

  subscribe<T extends PartialKey<EventType<QueryEventMap<D>>>>(
    type: T,
    listener: EventListener<QueryEventMap<D>, ExtractKey<EventType<QueryEventMap<D>>, T>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
}

export interface AegisMutation<D, R = D, I extends AegisId = AegisId> extends AegisUnknownMutation<D, R, I> {
  readonly $id: I;
  readonly item: AegisItem<D, I>;
}

// Item builder
export function $mutation<D, I extends AegisId>(entity: Entity<D>, query: Query<D>): AegisUnknownMutation<D, D, I>;
export function $mutation<D, R, I extends AegisId>(entity: Entity<D>, query: Query<R>, id: I): AegisMutation<D, R, I>;

export function $mutation<D, I extends AegisId>(entity: Entity<D>, query: Query<unknown>, id?: I) {
  const mutation = {
    $id: id,
    $query: query,
    $entity: entity,

    subscribe: query.subscribe.bind(query),

    get item() {
      return $item(entity, this.$id ?? query);
    },
    get isLoading() {
      return query.status === 'pending';
    },
    get result() {
      return query.result;
    }
  };

  if (!id) {
    (query as Query<D>).subscribe('update.completed', (data) => {
      Object.assign(mutation, {
        $id: JSON.parse(entity.storeItem(data.result))
      });
    });
  }

  return mutation;
}
