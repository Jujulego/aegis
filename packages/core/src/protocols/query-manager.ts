import { EventSource, EventUnsubscribe } from '../events';

import { Query, QueryStateCompleted, QueryStateFailed, QueryStatePending } from './query';

// Types
export type RefreshStrategy = 'keep' | 'replace';

export type QueryManagerEventMap<D> = {
  'status.pending': QueryStatePending,
  'status.completed': QueryStateCompleted<D>,
  'status.failed': QueryStateFailed,
}

// Class
/**
 * Manages queries for one resource.
 * Simplify registering to resource refresh updates.
 *
 * Handles 2 refresh strategies, used when refreshing resource while a query is still pending:
 * - 'keep' strategy: keeps pending query, and do not start a new one
 * - 'replace' strategy: cancel pending query, and start a new one
 *
 * Events emitted:
 * - 'status.pending' emitted when a new query is started
 * - 'status.completed' emitted when the running query completes
 * - 'status.failed' emitted when the running query fails
 */
export class QueryManager<D> extends EventSource<QueryManagerEventMap<D>> {
  // Attributes
  private _query?: Query<D>;
  private _unsub?: EventUnsubscribe;

  // Methods
  /**
   * Calls fetcher to start a new query fetching the resource, according to given refresh strategy.
   *
   * @param fetcher should returns a new query
   * @param strategy refresh strategy to use (see {@link QueryManager} for details)
   */
  refresh(fetcher: () => Query<D>, strategy: RefreshStrategy): Query<D> {
    // Handle previous query
    if (this._query?.status === 'pending') {
      if (strategy === 'keep') {
        return this._query;
      } else if (strategy === 'replace') {
        this._query.cancel();
      } else {
        throw new Error(`Unsupported strategy ${strategy}`);
      }
    }

    // Unsubscribe previous query
    if (this._unsub) {
      this._unsub();
    }

    // Register new query
    this._query = fetcher();

    this._unsub = this._query.subscribe('status', (state, metadata) => {
      // Emit event & store
      this.emit(`status.${state.status}`, state, { source: metadata.origin });
    });

    this.emit(`status.${this._query.state.status}`, this._query.state);

    return this._query;
  }

  /**
   * Return a promise awaiting next query result.
   * It will resolve if next query completes and reject if it fails
   */
  nextResult(): Promise<D> {
    return Promise.race([
      this.waitFor('status.completed').then(([data]) => data.result),
      this.waitFor('status.failed').then(([data]) => { throw data.error; })
    ]);
  }

  // Properties
  /**
   * Returns current pending query or last completed/failed query
   */
  get query(): Query<D> | undefined {
    return this._query;
  }
}
