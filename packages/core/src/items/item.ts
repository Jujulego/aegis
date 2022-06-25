import { EventEmitter, EventSource, EventUnsubscribe } from '../events';
import { AegisEntity } from '../entities';
import { AegisQuery, QueryStatus } from '../protocols';
import { StoreUpdateListener, StoreUpdateListenerOptions } from '../stores';

import { ItemQueryEvent, ItemQueryListener, ItemQueryListenerOptions } from './item-query.event';

// Class
export class AegisItem<T> extends EventSource<ItemQueryEvent<T>> implements EventEmitter {
  // Attributes
  private _query?: AegisQuery<T>;

  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly id: string,
  ) {
    super();
  }

  // Methods
  subscribe(type: 'query', listener: ItemQueryListener<T>, opts?: ItemQueryListenerOptions<T>): EventUnsubscribe;
  subscribe(type: 'update', listener: StoreUpdateListener<T>, opts?: Omit<StoreUpdateListenerOptions<T>, 'key'>): EventUnsubscribe;
  subscribe(
    type: 'update' | 'query',
    listener: ItemQueryListener<T> | StoreUpdateListener<T>,
    opts?: ItemQueryListenerOptions<T> | Omit<StoreUpdateListenerOptions<T>, 'key'>
  ): EventUnsubscribe {
    if (type === 'update') {
      return this.entity.subscribe(
        'update',
        listener as StoreUpdateListener<T>,
        { ...opts, key: [this.id] }
      );
    } else {
      return super.subscribe(
        type,
        listener as ItemQueryListener<T>,
        opts
      );
    }
  }

  refresh(fetcher: () => AegisQuery<T>): AegisQuery<T> {
    if (this._query?.status !== 'pending') {
      // Register query
      this._query = fetcher();

      this._query.subscribe('update', (event) => {
        if (this._query !== event.source) return;

        this.emit('query', event.data, { key: event.key, source: event.source });

        if (event.data.new.status === 'completed') {
          this.entity.setItem(this.id, event.data.new.data);
        }
      });

      this.emit('query', { new: this._query.state }, { key: ['pending'], source: this._query });
    }

    return this._query;
  }

  // Properties
  get status(): QueryStatus {
    return this._query?.status ?? 'pending';
  }

  get query(): AegisQuery<T> | undefined {
    return this._query;
  }

  get data(): T | undefined {
    return this.entity.getItem(this.id);
  }

  set data(value: T | undefined) {
    if (value === undefined) {
      this.entity.deleteItem(this.id);
    } else {
      this.entity.setItem(this.id, value);
    }
  }
}
