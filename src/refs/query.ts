import { EventKey, Listenable, Listener, multiplexer$, OffFn, once$, source$ } from '@jujulego/event-tree';
import { Query, queryfy, QueryState } from '@jujulego/utils';

import { AsyncRef } from '../defs/index.js';

// Types
export type QueryFetcher<D> = () => PromiseLike<D>;

export interface QueryOpts {
  strategy?: QueryStrategy;
}

export const enum QueryStrategy {
  /** Keep the current Query, and then fetcher will not be called. */
  keep = 'keep',
  /** Cancels the current Query and replace it. */
  replace = 'replace',
}

export type QueryRefEventMap<D> = {
  pending: true;
  done: D;
  failed: Error;
};

export interface QueryRef<D> extends AsyncRef<D>, Listenable<QueryRefEventMap<D>> {
  // Attributes
  /**
   * Last started query
   */
  readonly query: Query<D> | undefined;

  // Methods
  /**
   * Triggers refresh of the q-ref. Will call fetcher to replace current Query according to its state and the selected
   * strategy. If the current Query is completed (done or failed) it will call fetcher to initiate a new Query.
   *
   * @return Query the current pending query
   */
  read(): Query<D>;

  /**
   * Unregister all listeners, or only "key" listeners if given
   * @param key
   */
  clear(key?: EventKey<QueryRefEventMap<D>>): void;
}

// Builder
export function query$<D>(fetcher: QueryFetcher<D>, opts: QueryOpts = {}): QueryRef<D> {
  const strategy = opts.strategy ?? QueryStrategy.replace;
  const events = multiplexer$({
    'pending': source$<true>(),
    'done': source$<D>(),
    'failed': source$<Error>(),
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
    read() {
      if (query?.status === 'pending') {
        if (strategy === QueryStrategy.keep) {
          // Keep previous query
          return query;
        } else {
          // Cancel previous
          cancel();
        }
      }

      // Start a new query
      query = queryfy(fetcher());
      emit(query.state);

      if (query.status === 'pending') {
        queryOff = once$(query, emit);
      }

      return query;
    },

    get query() {
      return query;
    }
  };
}
