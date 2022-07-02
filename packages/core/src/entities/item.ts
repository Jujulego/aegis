import { EventKey, EventListener, EventListenerOptions, EventUnsubscribe } from '../events';
import { AegisQuery, QueryManager, QueryManagerEventMap, RefreshStrategy } from '../protocols';
import { StoreEventMap } from '../stores';
import { PartialKey, StringKey } from '../utils';

import { AegisEntity } from './entity';

// Class
export class AegisItem<D> {
  // Attributes
  private _manager = new QueryManager<D>();

  // Constructor
  constructor(
    readonly entity: AegisEntity<D>,
    readonly id: string,
  ) {
    this._manager.subscribe('query.completed', (data) => {
      if (data.status === 'completed') {
        this.entity.setItem(this.id, data.result);
      }
    });
  }

  // Methods
  subscribe(
    key: 'update',
    listener: EventListener<StoreEventMap<D>, 'update'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe(
    key: StringKey<PartialKey<EventKey<QueryManagerEventMap<D>, 'query'>>>,
    listener: EventListener<QueryManagerEventMap<D>, 'query'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe(
    key: 'update' | StringKey<PartialKey<EventKey<QueryManagerEventMap<D>, 'query'>>>,
    listener: EventListener<StoreEventMap<D>, 'update'> | EventListener<QueryManagerEventMap<D>, 'query'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    if (key === 'update') {
      return this.entity.subscribe(`update.${this.id}`, listener as EventListener<StoreEventMap<D>, 'update'>, opts);
    }

    return this._manager.subscribe(key, listener as EventListener<QueryManagerEventMap<D>, 'query'>, opts);
  }

  refresh(fetcher: () => AegisQuery<D>, strategy: RefreshStrategy): AegisQuery<D> {
    return this._manager.refresh(fetcher, strategy);
  }

  // Properties
  get manager(): QueryManager<D> {
    return this._manager;
  }

  get query(): AegisQuery<D> | undefined {
    return this._manager.query;
  }

  get isLoading(): boolean {
    return this.query?.status === 'pending';
  }

  get data(): D | undefined {
    return this.entity.getItem(this.id);
  }

  set data(value: D | undefined) {
    if (value === undefined) {
      this.entity.deleteItem(this.id);
    } else {
      this.entity.setItem(this.id, value);
    }
  }
}
