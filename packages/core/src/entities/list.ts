import { EventType, EventListener, EventListenerOptions, EventSource, EventUnsubscribe } from '../events';
import { Query, QueryManager, QueryManagerEventMap, RefreshStrategy } from '../protocols';
import { ExtractKey, PartialKey } from '../utils';

import { Entity } from './entity';

// Types
export type ListEventMap<D> = {
  update: D[],
}

// Class
/**
 * Represents a list of items.
 * Lists are identified by a string "key", 2 lists with the same key
 * for the same entity is considered as the same list.
 *
 * The list items are store in the entity's store, this object only keeps their ids to build an array containing all items.
 *
 * Events emitted:
 * - 'update' emitted when list contents changes
 * - 'query.pending' emitted when a new query is started
 * - 'query.completed' emitted when the running query completes
 * - 'query.failed' emitted when the running query fails
 */
export class List<D> extends EventSource<ListEventMap<D>> {
  // Attributes
  private _ids: string[] = [];
  private _cache?: WeakRef<D[]>;
  private _manager = new QueryManager<D[]>();

  private _pristine = true;

  // Constructor
  constructor(
    readonly entity: Entity<D>,
    readonly key: string,
  ) {
    super();

    // Subscribe to manager events
    this._manager.subscribe('status.completed', (data) => {
      this._ids = data.result.map(item => this.entity.storeItem(item));
      this._cache = new WeakRef(data.result);
      this._markDirty();
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
  subscribe<T extends PartialKey<EventType<QueryManagerEventMap<D>>>>(
    type: T,
    listener: EventListener<QueryManagerEventMap<D[]>, ExtractKey<EventType<QueryManagerEventMap<D[]>>, T>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe(
    key: 'update' | PartialKey<EventType<QueryManagerEventMap<D[]>>>,
    listener: EventListener<ListEventMap<D>, 'update'> | EventListener<QueryManagerEventMap<D[]>, ExtractKey<EventType<QueryManagerEventMap<D>>, 'status'>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    if (key === 'update') {
      return super.subscribe('update', listener as EventListener<ListEventMap<D>, 'update'>, opts);
    }

    return this._manager.subscribe(key, listener as EventListener<QueryManagerEventMap<D[]>, ExtractKey<EventType<QueryManagerEventMap<D[]>>, 'status'>>, opts);
  }

  /**
   * Refresh list contents using given fetcher, using inner manager
   * @see QueryManager.refresh
   *
   * @param fetcher should returns a new query
   * @param strategy refresh strategy to use (see {@link QueryManager} for details)
   */
  refresh(fetcher:  () => Query<D[]>, strategy: RefreshStrategy): Query<D[]> {
    return this._manager.refresh(fetcher, strategy);
  }

  // Properties
  /**
   * Used {@link QueryManager} for the list, handles refresh and queries
   */
  get manager(): QueryManager<D[]> {
    return this._manager;
  }

  /**
   * Returns current pending query or last completed/failed query
   * @see QueryManager.query
   */
  get query(): Query<D[]> | undefined {
    return this._manager.query;
  }

  /**
   * Returns true if a query for this list is currently pending
   * @see Query
   */
  get isLoading(): boolean {
    return this.query?.status === 'pending';
  }

  /**
   * Rebuilds list contents as array, using stored ids.
   * Result is cached so 2 consecutive access will return the same array.
   * @see Entity.getItem
   */
  get data(): D[] {
    // Use cache first
    const cached = this._cache?.deref();

    if (cached) {
      return cached;
    }

    // Read from store
    const data: D[] = [];

    for (const id of this._ids) {
      const ent = this.entity.getItem(id);

      if (ent) {
        data.push(ent);
      }
    }

    this._cache = new WeakRef(data);

    return data;
  }

  /**
   * Locally updates the list.
   * Create or update list items in the store, and keep their ids.
   * Given object will be stored in the cache.
   * @see Entity.storeItem
   *
   * @param data
   */
  set data(data: D[]) {
    this._ids = data.map(item => this.entity.storeItem(item));
    this._cache = new WeakRef(data);

    this.emit('update', this.data);
  }
}
