import { EventSource } from '../events';

import { AegisQuery, QueryState, QueryStatus } from './query';

// Types
export type RefreshStrategy = 'keep' | 'replace';

export type QueryManagerEventMap<D> = {
  query: { data: Readonly<QueryState<D>>, filters: [QueryStatus] },
}

// Class
export class QueryManager<D> extends EventSource<QueryManagerEventMap<D>> {
  // Attributes
  private _query?: AegisQuery<D>;

  // Methods
  refresh(fetcher: () => AegisQuery<D>, strategy: RefreshStrategy): AegisQuery<D> {
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

    // Register new query
    this._query = fetcher();

    this._query.subscribe('update', (state, metadata) => {
      // Ignore previous query's events
      if (this._query !== metadata.source) {
        return;
      }

      // Emit event & store
      this.emit(`query.${state.status}`, state, { source: metadata.source });
    });

    this.emit('query.pending', this._query.state);

    return this._query;
  }

  // Properties
  get query(): AegisQuery<D> | undefined {
    return this._query;
  }
}
