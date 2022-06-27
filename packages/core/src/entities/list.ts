import { EventSource } from '../events';
import { AegisQuery, QueryStatus, QueryUpdateEvent } from '../protocols';

import { AegisEntity } from './entity';

// Types
export type ListEventMap<D> = {
  query: { data: QueryUpdateEvent<D[]>, filters: ['pending' | 'completed' | 'error'] },
  update: { data: D[], filters: [] },
}

// Class
export class AegisList<D> extends EventSource<ListEventMap<D>> {
  // Attributes
  private _ids: string[] = [];
  private _cache?: WeakRef<D[]>;
  private _query?: AegisQuery<D[]>;

  private _pristine = true;

  // Constructor
  constructor(
    readonly entity: AegisEntity<D>,
    readonly key: string,
  ) {
    super();

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

  refresh(query: AegisQuery<D[]>): AegisQuery<D[]> {
    if (this._query?.status === 'pending') {
      this._query.cancel();
    }

    // Register query
    this._query = query;

    this._query.subscribe('update', (data, event) => {
      if (this._query !== event.source) return;

      this.emit(`query.${event.filters[0]}`, data, { source: event.source });

      if (data.new.status === 'completed') {
        this._ids = data.new.data.map(item => this.entity.storeItem(item));
        this._cache = undefined;
        this._markDirty();
      }
    });

    this.emit('query.pending', { new: this._query.state }, { source: this._query });

    return this._query;
  }

  // Properties
  get status(): QueryStatus {
    return this._query?.status ?? 'pending';
  }

  get query(): AegisQuery<D[]> | undefined {
    return this._query;
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
