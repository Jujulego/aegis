import {
  Entity,
  EventListener,
  EventListenerOptions, EventType,
  EventUnsubscribe, ExtractKey, List, ListEventMap,
  PartialKey, Query, QueryManagerEventMap, RefreshStrategy
} from '@jujulego/aegis-core';

import { Refreshable } from './utils';

// Types
export interface AegisList<T> {
  readonly $key: string;
  readonly $list: List<T>;
  readonly $entity: Entity<T>;

  readonly isLoading: boolean;
  data: T[];

  subscribe(
    key: 'update',
    listener: EventListener<ListEventMap<T>, 'update'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe<T extends PartialKey<EventType<QueryManagerEventMap<T>>>>(
    type: T,
    listener: EventListener<QueryManagerEventMap<T>, ExtractKey<EventType<QueryManagerEventMap<T>>, T>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
}

// Item builder
export function $list<T>(entity: Entity<T>, key: string): AegisList<T>;
export function $list<T>(entity: Entity<T>, key: string, refresh: () => Query<T[]>): AegisList<T> & Refreshable<T>;

export function $list<T>(entity: Entity<T>, key: string, refresh?: () => Query<T[]>) {
  const list: AegisList<T> = {
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
    set data(value: T[]) {
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
