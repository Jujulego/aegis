import {
  Entity,
  EventListener,
  EventListenerOptions, EventType,
  EventUnsubscribe, ExtractKey, List, ListEventMap,
  PartialKey, Query, QueryManagerEventMap, RefreshStrategy
} from '@jujulego/aegis-core';

import { Refreshable } from './utils';

// Types
export interface AegisList<D> {
  readonly $key: string;
  readonly $list: List<D>;
  readonly $entity: Entity<D>;

  readonly isLoading: boolean;
  data: D[];

  subscribe(
    key: 'update',
    listener: EventListener<ListEventMap<D>, 'update'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe<T extends PartialKey<EventType<QueryManagerEventMap<D>>>>(
    type: T,
    listener: EventListener<QueryManagerEventMap<D>, ExtractKey<EventType<QueryManagerEventMap<D>>, T>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
}

// Item builder
export function $list<D>(entity: Entity<D>, key: string): AegisList<D>;
export function $list<D>(entity: Entity<D>, key: string, refresh: () => Query<D[]>): AegisList<D> & Refreshable<D[]>;

export function $list<D>(entity: Entity<D>, key: string, refresh?: () => Query<D[]>) {
  const list: AegisList<D> = {
    $key: key,
    $list: entity.list(key),
    $entity: entity,

    subscribe(...args: unknown[]) {
      return this.$list.subscribe(...args);
    },

    get isLoading() {
      return this.$list.isLoading;
    },

    get data() {
      return this.$list.data ?? [];
    },
    set data(value: D[]) {
      this.$list.data = value;
    }
  };

  if (refresh) {
    return Object.assign(list, {
      refresh(strategy: RefreshStrategy = 'keep') {
        return list.$list.refresh(refresh, strategy);
      }
    });
  }

  return list;
}
