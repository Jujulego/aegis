import { EventKey, EventListener, EventListenerOptions, EventSource, EventUnsubscribe } from '../events';
import { AegisQuery, QueryStatus, QueryUpdateEvent } from '../protocols';
import { StoreEventMap } from '../stores';
import { PartialKey, StringKey } from '../utils';

import { AegisEntity } from './entity';

// Types
export type ItemEventMap<D> = {
  query: { data: QueryUpdateEvent<D>, filters: ['pending' | 'completed' | 'error'] },
};

// Class
export class AegisItem<D> extends EventSource<ItemEventMap<D>> {
  // Attributes
  private _query?: AegisQuery<D>;

  // Constructor
  constructor(
    readonly entity: AegisEntity<D>,
    readonly id: string,
  ) {
    super();
  }

  // Methods
  subscribe(
    key: 'update',
    listener: EventListener<StoreEventMap<D>, 'update'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe<T extends keyof ItemEventMap<D>>(
    key: StringKey<PartialKey<EventKey<ItemEventMap<D>, T>>>,
    listener: EventListener<ItemEventMap<D>, T>,
    opts?: EventListenerOptions
  ): EventUnsubscribe;
  subscribe(
    key: 'update' | StringKey<PartialKey<EventKey<ItemEventMap<D>, keyof ItemEventMap<D>>>>,
    listener: EventListener<StoreEventMap<D>, 'update'> | EventListener<ItemEventMap<D>, keyof ItemEventMap<D>>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    if (key === 'update') {
      return this.entity.subscribe(`update.${this.id}`, listener as EventListener<StoreEventMap<D>, 'update'>, opts);
    }

    return super.subscribe(key, listener as EventListener<ItemEventMap<D>, keyof ItemEventMap<D>>, opts);
  }

  refresh(fetcher: () => AegisQuery<D>): AegisQuery<D> {
    if (this._query?.status !== 'pending') {
      // Register query
      this._query = fetcher();

      this._query.subscribe('update', (data, mtd) => {
        if (this._query !== mtd.source) return;

        this.emit(`query.${mtd.filters[0]}`, data, { source: mtd.source });

        if (data.new.status === 'completed') {
          this.entity.setItem(this.id, data.new.data);
        }
      });

      this.emit('query.pending', { new: this._query.state }, { source: this._query });
    }

    return this._query;
  }

  // Properties
  get status(): QueryStatus {
    return this._query?.status ?? 'pending';
  }

  get query(): AegisQuery<D> | undefined {
    return this._query;
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
