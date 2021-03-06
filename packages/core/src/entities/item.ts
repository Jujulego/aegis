import { EventType, EventListener, EventListenerOptions, EventUnsubscribe } from '../events';
import { Query, QueryManager, QueryManagerEventMap, RefreshStrategy } from '../protocols';
import { StoreEventMap } from '../stores';
import { ExtractKey, PartialKey } from '../utils';

import { Entity } from './entity';

// Class
/**
 * Represents one distant item.
 * Item's data will be stored in the entity's store, this object only keeps its id.
 *
 * Events emitted:
 * - 'update' emitted when item contents changes
 * - 'query.pending' emitted when a new query is started
 * - 'query.completed' emitted when the running query completes
 * - 'query.failed' emitted when the running query fails
 */
export class Item<D> {
  // Attributes
  private _manager = new QueryManager<D>();

  // Constructor
  constructor(
    readonly entity: Entity<D>,
    readonly id: string,
  ) {
    // Subscribe to manager events
    this._manager.subscribe('query.completed', (data) => {
      this.entity.setItem(this.id, data.result);
    });
  }

  // Methods
  subscribe(
    key: 'update',
    listener: EventListener<StoreEventMap<D>, `update.${string}.${string}`>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe<T extends PartialKey<EventType<QueryManagerEventMap<D>>>>(
    type: T,
    listener: EventListener<QueryManagerEventMap<D>, ExtractKey<EventType<QueryManagerEventMap<D>>, T>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe(
    key: 'update' | PartialKey<EventType<QueryManagerEventMap<D>>>,
    listener: EventListener<StoreEventMap<D>, `update.${string}.${string}`> | EventListener<QueryManagerEventMap<D>, ExtractKey<EventType<QueryManagerEventMap<D>>, 'query'>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    if (key === 'update') {
      return this.entity.subscribe(`update.${this.id}`, listener as EventListener<StoreEventMap<D>, `update.${string}.${string}`>, opts);
    }

    return this._manager.subscribe(key, listener as EventListener<QueryManagerEventMap<D>, ExtractKey<EventType<QueryManagerEventMap<D>>, 'query'>>, opts);
  }

  /**
   * Refresh item data using given fetcher, using inner manager
   * @see QueryManager.refresh
   *
   * @param fetcher should returns a new query
   * @param strategy refresh strategy to use (see {@link QueryManager} for details)
   */
  refresh(fetcher: () => Query<D>, strategy: RefreshStrategy): Query<D> {
    return this._manager.refresh(fetcher, strategy);
  }

  // Properties
  /**
   * Used {@link QueryManager} for the item, handles refresh and queries
   */
  get manager(): QueryManager<D> {
    return this._manager;
  }

  /**
   * Returns current pending query or last completed/failed query
   * @see QueryManager.query
   */
  get query(): Query<D> | undefined {
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
   * Reads item from the store
   * @see Entity.getItem
   */
  get data(): D | undefined {
    return this.entity.getItem(this.id);
  }

  /**
   * Locally update item in the store.
   * Setting `undefined` here will delete item in the store.
   * @see Entity.setItem
   * @see Entity.deleteItem
   *
   * @param value
   */
  set data(value: D | undefined) {
    if (value === undefined) {
      this.entity.deleteItem(this.id);
    } else {
      this.entity.setItem(this.id, value);
    }
  }
}
