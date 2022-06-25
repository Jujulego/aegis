import { EventSource } from '../events';
import { AegisEntity } from '../entities';
import { AegisQuery, QueryStatus } from '../protocols';

import { ListQueryEvent } from './list-query.event';
import { ListUpdateEvent } from './list-update.event';

// Class
export class AegisList<T> extends EventSource<ListQueryEvent<T> | ListUpdateEvent<T>> {
  // Attributes
  private _ids: string[] = [];
  private _cache?: WeakRef<T[]>;
  private _query?: AegisQuery<T[]>;

  private _pristine = true;

  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly key: string,
  ) {
    super();

    // Subscribe to entity update events
    this.entity.subscribe('update', (event) => {
      if (this._ids.includes(event.data.id)) {
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

  refresh(query: AegisQuery<T[]>): AegisQuery<T[]> {
    if (this._query?.status === 'pending') {
      this._query.cancel();
    }

    // Register query
    this._query = query;

    this._query.subscribe('update', (event) => {
      if (this._query !== event.source) return;

      this.emit('query', event.data, { source: event.source });

      if (event.data.new.status === 'completed') {
        this._ids = event.data.new.data.map(item => this.entity.storeItem(item));
        this._cache = undefined;
        this._markDirty();
      }
    });

    this.emit('query', { new: this._query.state }, { key: ['pending'], source: this._query });

    return this._query;
  }

  // Properties
  get status(): QueryStatus {
    return this._query?.status ?? 'pending';
  }

  get query(): AegisQuery<T[]> | undefined {
    return this._query;
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

  set data(data: T[]) {
    this._ids = data.map(item => this.entity.storeItem(item));
    this._cache = new WeakRef(data);

    this.emit('update', this.data);
  }
}
