import { EventKey, EventListener, EventListenerOptions, EventSource, EventUnsubscribe } from '../events';
import { AegisQuery, QueryManager, QueryManagerEventMap, QueryStatus, RefreshStrategy } from '../protocols';
import { PartialKey, StringKey } from '../utils';

import { AegisEntity } from './entity';

// Types
export type ListEventMap<D> = {
  update: { data: D[], filters: [] },
}

// Class
export class AegisList<D> extends EventSource<ListEventMap<D>> {
  // Attributes
  private _ids: string[] = [];
  private _cache?: WeakRef<D[]>;
  private _manager = new QueryManager<D[]>();

  private _pristine = true;

  // Constructor
  constructor(
    readonly entity: AegisEntity<D>,
    readonly key: string,
  ) {
    super();

    // Subscribe to manager events
    this._manager.subscribe('query.completed', (data) => {
      if (data.status === 'completed') {
        this._ids = data.result.map(item => this.entity.storeItem(item));
        this._cache = new WeakRef(data.result);
        this._markDirty();
      }
    });

    // Subscribe to entity update events
    this.entity.subscribe('update', (data) => {
      if (this._ids.includes(data.id)) {
        this._cache = undefined;
        this._markDirty();
      }
    });
  }

  // Methods
  private _markDirty(): void {
    if (this._pristine) {
      this._pristine = false;
      queueMicrotask(() => this._markPristine());
    }
  }

  private _markPristine(): void {
    if (!this._pristine) {
      this.emit('update', this.data);
      this._pristine = true;
    }
  }

  subscribe(
    key: 'update',
    listener: EventListener<ListEventMap<D>, 'update'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe(
    key: StringKey<PartialKey<EventKey<QueryManagerEventMap<D>, 'query'>>>,
    listener: EventListener<QueryManagerEventMap<D[]>, 'query'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe(
    key: 'update' | StringKey<PartialKey<EventKey<QueryManagerEventMap<D>, 'query'>>>,
    listener: EventListener<ListEventMap<D>, 'update'> | EventListener<QueryManagerEventMap<D[]>, 'query'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    if (key === 'update') {
      return super.subscribe('update', listener as EventListener<ListEventMap<D>, 'update'>, opts);
    }

    return this._manager.subscribe(key, listener as EventListener<QueryManagerEventMap<D[]>, 'query'>, opts);
  }


  refresh(fetcher:  () => AegisQuery<D[]>, strategy: RefreshStrategy): AegisQuery<D[]> {
    return this._manager.refresh(fetcher, strategy);
  }

  // Properties
  get manager(): QueryManager<D[]> {
    return this._manager;
  }

  get query(): AegisQuery<D[]> | undefined {
    return this._manager.query;
  }

  get status(): QueryStatus {
    return this.query?.status ?? 'pending';
  }

  get data(): D[] {
    // Use cache first
    const cached = this._cache?.deref();

    if (cached) {
      return cached;
    }

    // Read from store
    const data: D[] = [];

    for (const id of this._ids) {
      const ent = this.entity.store.get<D>(this.entity.name, id);

      if (ent) {
        data.push(ent);
      }
    }

    this._cache = new WeakRef(data);

    return data;
  }

  set data(data: D[]) {
    this._ids = data.map(item => this.entity.storeItem(item));
    this._cache = new WeakRef(data);

    this.emit('update', this.data);
  }
}
