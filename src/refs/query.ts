import { EventKey, IListenable, Listener, multiplexer, OffFn, offGroup, once, source } from '@jujulego/event-tree';
import { Query, queryfy, QueryState } from '@jujulego/utils';

import { AsyncRef } from './ref.js';

// Types
export type QueryFetcher<D> = () => PromiseLike<D>;
export type QueryStrategy = 'keep' | 'replace';

export type QueryRefEventMap<D> = {
  pending: true;
  done: D;
  failed: Error;
};

export interface QueryRef<D> extends AsyncRef<D>, IListenable<QueryRefEventMap<D>> {
  // Attributes
  readonly data: D | undefined;
  readonly query: Query<D> | undefined;

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
  refresh(strategy: QueryStrategy): Query<D>;

  /*
   * Cancels current pending query
   */
  cancel(): void;

  /**
   * Unregister all listeners, or only "key" listeners if given
   * @param key
   */
  clear(key?: EventKey<QueryRefEventMap<D>>): void;
}

// Builder
export function query$<D>(fetcher: QueryFetcher<D>): QueryRef<D> {
  const events = multiplexer({
    'pending': source<true>(),
    'done': source<D>(),
    'failed': source<Error>(),
  });

  let query: Query<D> | undefined;
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

  function emit(state: QueryState<D>) {
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

    subscribe: (listener: Listener<D>) => events.on('done', listener),
    unsubscribe: (listener: Listener<D>) => events.off('done', listener),

    // References
    next(data: D) {
      events.emit('done', data);
    },
    async read() {
      const state = query?.state;

      if (state?.status !== 'done') {
        return new Promise<D>((resolve, reject) => {
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
