import {
  EventGroupKey,
  EventGroupListener,
  EventListenerOptions,
  EventObservable,
  EventUnsubscribe
} from '@jujulego/event-tree';
import { Query, QueryManager, QueryManagerEventMap, RefreshStrategy } from '../protocols';
import { StoreDeleteEvent, StoreUpdateEvent } from '../stores';

import { Entity } from './entity';
import { DataState } from './types';

// Types
export type ItemEventMap<D> = QueryManagerEventMap<D> & {
  update: StoreUpdateEvent<D>;
  delete: StoreDeleteEvent<D>;
}

// Class
/**
 * Represents one distant item.
 * Item's data will be stored in the entity's store, this object only keeps its id.
 *
 * Events emitted:
 * - 'update' emitted when item contents changes
 * - 'delete' emitted when item contents are deleted
 * - 'query.pending' emitted when a new query is started
 * - 'query.completed' emitted when the running query completes
 * - 'query.failed' emitted when the running query fails
 */
export class Item<D> implements EventObservable<ItemEventMap<D>> {
  // Attributes
  private _manager = new QueryManager<D>();

  // Constructor
  constructor(
    readonly entity: Entity<D>,
    readonly id: string,
  ) {
    // Subscribe to manager events
    this._manager.subscribe('status.completed', (data) => {
      this.entity.setItem(this.id, data.result);
    });
  }

  // Methods
  subscribe<GK extends EventGroupKey<ItemEventMap<D>>>(
    key: GK,
    listener: EventGroupListener<ItemEventMap<D>, GK>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    if (key === 'update' || key === 'delete') {
      return this.entity.subscribe(`${key as 'update' | 'delete'}.item.${this.id}`, listener as any, opts);
    } else {
      return this._manager.subscribe(key, listener as any, opts);
    }
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
   * Returns data state
   */
  get state(): DataState {
    if (this.data !== undefined) {
      if (this.query?.status === 'completed') {
        return 'loaded';
      } else {
        return 'cached';
      }
    }

    return 'unknown';
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
