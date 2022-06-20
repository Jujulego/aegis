import { EventSource } from '../events';
import { $AegisEntity } from '../entities';
import { AegisQuery, QueryStatus } from '../protocols';

import { ListQueryEvent } from './list-query.event';
import { ListUpdateEvent } from './list-update.event';

// Class
export class AegisList<T> extends EventSource<ListQueryEvent<T> | ListUpdateEvent<T>> {
  // Attributes
  private _ids: string[] = [];
  private _cache?: WeakRef<T[]>;
  private _query?: AegisQuery<T[]>;

  // Constructor
  constructor(
    readonly entity: $AegisEntity<T>,
    readonly id: string,
  ) {
    super();
  }

  // Methods
  query(query: AegisQuery<T[]>): AegisQuery<T[]> {
    if (this._query?.status === 'pending') {
      this._query.cancel();
    }

    // Register query
    this._query = query;

    this._query.subscribe('update', (event) => {
      if (this._query !== event.source) return;

      this.emit('query', event.data, { source: event.source });

      if (event.data.data.status === 'completed') {
        this._ids = event.data.data.data.map(item => this.entity.storeItem(item));
        this.emit('update', {
          old: this._cache?.deref(),
          new: this.data
        });
      }
    });

    this.emit('query', { data: this._query.state }, { key: ['pending'], source: this._query });

    return this._query;
  }

  // Properties
  get status(): QueryStatus {
    return this._query?.status ?? 'pending';
  }

  get data(): T[] {
    // Use cache first
    const cached = this._cache?.deref();

    if (cached) {
      return cached;
    }

    // Read from store
    const data: T[] = [];

    for (const id of this._ids) {
      const ent = this.entity.store.get<T>(this.entity.name, id);

      if (ent) {
        data.push(ent);
      }
    }

    this._cache = new WeakRef(data);

    return data;
  }
}
