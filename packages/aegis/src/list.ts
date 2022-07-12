import {
  Entity,
  EventListener,
  EventListenerOptions, EventType,
  EventUnsubscribe, ExtractKey, List, ListEventMap,
  PartialKey, Query, QueryManagerEventMap, RefreshStrategy
} from '@jujulego/aegis-core';

import { Refreshable } from './utils';

// Types
export interface AegisList<D> extends PromiseLike<D[]> {
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
  const $list = entity.list(key);

  const list: AegisList<D> = {
    $key: key,
    $list,
    $entity: entity,

    subscribe: $list.subscribe.bind($list),
    then<R1 = D[], R2 = never>(
      onfulfilled?: ((value: D[]) => (PromiseLike<R1> | R1)) | undefined | null,
      onrejected?: ((reason: Error) => (PromiseLike<R2> | R2)) | undefined | null
    ): PromiseLike<R1 | R2> {
      if ($list.query) {
        return $list.query.then(onfulfilled, onrejected);
      }

      return new Promise((res, rej) => {
        try {
          if ($list.data) {
            res(onfulfilled ? onfulfilled($list.data) : $list.data as unknown as R1);
          } else {
            const unsub = $list.subscribe('query', async (state) => {
              try {
                if (state.status === 'completed') {
                  unsub();
                  res(onfulfilled ? onfulfilled(state.result) : state.result as unknown as R1);
                } else if (state.status === 'failed') {
                  unsub();

                  if (onrejected) {
                    res(await onrejected(state.error));
                  } else {
                    rej(state.error);
                  }
                }
              } catch (err) {
                rej(err);
              }
            });
          }
        } catch (err) {
          rej(err);
        }
      });
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
