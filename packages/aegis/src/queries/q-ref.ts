import { group, IListenable, IObservable, OffGroup, offGroup, once, source, waitFor } from '@jujulego/event-tree';
import { Query, QueryState, QueryStateDone, QueryStateFailed, QueryStatePending } from '@jujulego/utils';

// Types
export type Fetcher<D> = () => Query<D>;
export type Strategy = 'keep' | 'replace';

export type QRefEventMap<D> = {
  pending: QueryStatePending;
  done: QueryStateDone<D>;
  failed: QueryStateFailed;
};

// Class
export class QRef<D> implements IObservable<QueryState<D>>, IListenable<QRefEventMap<D>> {
  // Attributes
  private _off?: OffGroup;
  private _query?: Query<D>;

  private readonly _events = group({
    'pending': source<QueryStatePending>(),
    'done': source<QueryStateDone<D>>(),
    'failed': source<QueryStateFailed>(),
  });

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly subscribe = this._events.subscribe;
  readonly unsubscribe = this._events.unsubscribe;

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

  get data(): D | undefined {
    return this._query?.data;
  }

  get isLoading(): boolean {
    return this._query?.status === 'pending';
  }
}
