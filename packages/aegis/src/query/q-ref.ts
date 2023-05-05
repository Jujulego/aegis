import {
  IListenable, IMultiplexer,
  Listener,
  multiplexer,
  OffGroup,
  offGroup,
  once,
  source
} from '@jujulego/event-tree';
import { queryfy, Query, QueryState } from '@jujulego/utils';

import { ReadonlyRef } from '../defs';

// Types
export type Fetcher<D> = () => PromiseLike<D>;
export type Strategy = 'keep' | 'replace';

export type QRefEventMap<D> = {
  pending: true;
  done: D;
  failed: Error;
};

export interface QRefReadOpts {
  /**
   * Should throw if current query fails ?
   */
  throws?: boolean;
}

/**
 * Reference on data received by query
 */
export class QRef<D> implements ReadonlyRef<D>, IListenable<QRefEventMap<D>> {
  // Attributes
  private _off?: OffGroup;
  private _query?: Query<D>;

  private readonly _events = multiplexer({
    'pending': source<true>(),
    'done': source<D>(),
    'failed': source<Error>(),
  }) as IMultiplexer<QRefEventMap<D>, QRefEventMap<D>>;

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;

  /**
   * Subscribe to data updates
   * @param listener
   */
  readonly subscribe = (listener: Listener<D>) => this._events.on('done', listener);

  /**
   * Unsubscribe from data updates
   * @param listener
   */
  readonly unsubscribe = (listener: Listener<D>) => this._events.off('done', listener);

  private _emitQueryState(state: QueryState<D>) {
    if (state.status === 'pending') {
      this._events.emit('pending', true);
    } else if (state.status === 'done') {
      this._events.emit('done', state.data);
    } else {
      this._events.emit('failed', state.error);
    }
  }

  /**
   * Triggers refresh of the q-ref. Will call fetcher to replace current Query according to its state and the selected
   * strategy. If the current Query is completed (done or failed) it will call fetcher to initiate a new Query.
   *
   * When the current Query is still pending, two strategies are available:
   * - `'keep'`: keep the current Query, and then fetcher will not be called.
   * - `'replace'`: cancels the current Query and replace using fetcher.
   *
   * @param fetcher called to initiate a new Query
   * @param strategy
   * @returns the current pending query
   */
  refresh(fetcher: Fetcher<D>, strategy: Strategy): Query<D> {
    // Keep previous query
    if (this._query?.status === 'pending' && strategy === 'keep') {
      return this._query;
    }

    this.cancel();

    // Create new query
    this._query = queryfy(fetcher());

    if (this._query.status === 'pending') {
      this._off = offGroup();
      once(this._query, (state) => this._emitQueryState(state), { off: this._off });
    }

    this._emitQueryState(this._query.state);

    return this._query;
  }

  /**
   * Cancels current query (if it is still pending).
   */
  cancel() {
    // Cancel query (if it is pending)
    if (this._query?.status === 'pending') {
      this._query.cancel();
    }

    // Unsubscribe to query
    if (this._off) {
      this._off();
      this._off = undefined;
    }
  }

  /**
   * Resolves to loaded data. Will return immediately if the current Query is done.
   */
  async read(opts: QRefReadOpts = {}): Promise<D> {
    const state = this._query?.state;

    if (state?.status !== 'done') {
      return new Promise<D>((resolve, reject) => {
        const off = offGroup();

        once(this._events, 'done', resolve, { off });

        if (opts.throws) {
          once(this._events, 'failed', (error) => reject(error), { off });
        }
      });
    }

    return state.data;
  }

  // Properties
  get query(): Query<D> | undefined {
    return this._query;
  }

  get data(): D | undefined {
    return this._query?.data;
  }

  get isEmpty(): boolean {
    return this._query?.status !== 'done';
  }

  get isLoading(): boolean {
    return this._query?.status === 'pending';
  }
}
