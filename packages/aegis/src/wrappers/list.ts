import { Entity, List, ListEventMap, Query, RefreshStrategy } from '@jujulego/aegis-core';
import { EventObservable } from '@jujulego/event-tree';

import { Refreshable } from '../utils';

// Types
export interface AegisList<D> extends EventObservable<ListEventMap<D>>, PromiseLike<D[]> {
  readonly $key: string;
  readonly $list: List<D>;
  readonly $entity: Entity<D>;

  readonly isLoading: boolean;
  readonly ids: string[];
  data: D[];
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
      if (!$list.isLoading && $list.data) {
        return Promise.resolve($list.data).then(onfulfilled, onrejected);
      }

      return $list.manager.nextResult()
        .then(onfulfilled, onrejected);
    },

    get isLoading() {
      return this.$list.isLoading;
    },

    get ids() {
      return this.$list.ids;
    },

    get data() {
      return this.$list.data;
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
