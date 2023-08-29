import { EventKey, IListenable, Listener, multiplexer, OffFn, offGroup, once, source } from '@jujulego/event-tree';
import { Query, queryfy, QueryState } from '@jujulego/utils';

import { AsyncRef } from './ref.js';

// Types
export type QueryFetcher<T> = () => PromiseLike<T>;
export type QueryStrategy = 'keep' | 'replace';

export type QueryRefEventMap<T> = {
  pending: true;
  done: T;
  failed: Error;
};

export interface QueryRef<T> extends AsyncRef<T>, IListenable<QueryRefEventMap<T>> {
  // Attributes
  readonly data: T | undefined;
  readonly query: Query<T> | undefined;

  // Methods
  /**
   * Triggers refresh of the q-ref. Will call fetcher to replace current Query according to its state and the selected
   * strategy. If the current Query is completed (done or failed) it will call fetcher to initiate a new Query.
   *
   * When the current Query is still pending, two strategies are available:
   * - `'keep'`: keep the current Query, and then fetcher will not be called.
   * - `'replace'`: cancels the current Query and replace using fetcher.
   *
   * @param strategy
   * @return Query the current pending query
   */
  refresh(strategy: QueryStrategy): Query<T>;

  /*
   * Cancels current pending query
   */
  cancel(): void;

  /**
   * Unregister all listeners, or only "key" listeners if given
   * @param key
   */
  clear(key?: EventKey<QueryRefEventMap<T>>): void;
}

// Builder
export function query$<T>(fetcher: QueryFetcher<T>): QueryRef<T> {
  const events = multiplexer({
    'pending': source<true>(),
    'done': source<T>(),
    'failed': source<Error>(),
  });

  let query: Query<T> | undefined;
  let queryOff: OffFn | undefined;

  function cancel() {
    // Cancel query (if it is pending)
    if (query?.status === 'pending') {
      query.cancel();
    }

    if (queryOff) {
      queryOff();
    }
  }

  function emit(state: QueryState<T>) {
    if (state.status === 'pending') {
      events.emit('pending', true);
    } else if (state.status === 'done') {
      events.emit('done', state.data);
    } else if (state.status === 'failed') {
      events.emit('failed', state.error);
    }
  }

  return {
    // Events
    on: events.on,
    off: events.off,
    clear: events.clear,

    subscribe: (listener: Listener<T>) => events.on('done', listener),
    unsubscribe: (listener: Listener<T>) => events.off('done', listener),

    // References
    next(data: T) {
      events.emit('done', data);
    },
    async read() {
      const state = query?.state;

      if (state?.status !== 'done') {
        return new Promise<T>((resolve, reject) => {
          const off = offGroup();

          once(events, 'done', resolve, { off });
          once(events, 'failed', reject, { off });
        });
      }

      return state.data;
    },
    refresh(strategy: QueryStrategy) {
      // Keep previous query
      if (query?.status === 'pending' && strategy === 'keep') {
        return query;
      }

      // Cancel previous and start a new query
      cancel();

      query = queryfy(fetcher());
      emit(query.state);

      if (query.status === 'pending') {
        queryOff = once(query, emit);
      }

      return query;
    },
    cancel,

    get data() {
      return query?.data;
    },
    get query() {
      return query;
    }
  };
}
