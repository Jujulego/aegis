import { group, OffGroup, offGroup, once, source, waitFor } from '@jujulego/event-tree';
import { Query, QueryStateDone, QueryStateFailed, QueryStatePending } from '@jujulego/utils';

// Types
export type Fetcher<D> = () => Query<D>;
export type Strategy = 'keep' | 'replace';

// Class
export class QRef<D> {
  // Attributes
  private _off?: OffGroup;
  private _query?: Query<D>;

  private readonly _events = group({
    'pending': source<QueryStatePending>(),
    'done': source<QueryStateDone<D>>(),
    'failed': source<QueryStateFailed>(),
  });

  // Methods
  refresh(fetcher: Fetcher<D>, strategy: Strategy): Query<D> {
    // Keep previous query
    if (this._query?.status === 'pending' && strategy === 'keep') {
      return this._query;
    }

    // Unsubscribe to previous query
    if (this._off) {
      this._off();
      this._off = undefined;
    }

    // Create new query
    this._query = fetcher();

    if (this._query.status === 'pending') {
      this._off = offGroup();
      once(this._query, (state) => this._events.emit(state.status, state), { off: this._off });
    }

    this._events.emit(this._query.state.status, this._query.state);

    return this._query;
  }

  async read(): Promise<D> {
    let state = this._query?.state;

    if (state?.status !== 'done') {
      state = await waitFor(this._events, 'done');
    }

    return state.data;
  }

  // Properties
  get query(): Query<D> | undefined {
    return this._query;
  }
}
