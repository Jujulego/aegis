import { TypedEventTarget } from '../event-target';
import { AegisQuery } from '../protocols';

import { AegisEntity, EntityIdExtractor } from './entity';
import { ListUpdateEvent } from './list-update.event';

// List
export class AegisList<T> extends TypedEventTarget<ListUpdateEvent<T>> {
  // Attributes
  private _ids: string[] = [];
  private _query?: WeakRef<AegisQuery<T[]>>;
  private readonly _extractor: EntityIdExtractor<T>;

  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly key: string,
    extractor: EntityIdExtractor<T>,
    query?: AegisQuery<T[]>,
  ) {
    super();

    // Init
    this._extractor = extractor;

    if (query) {
      this._storeQuery(query);
    }

    // Listen for query update
    this.entity.addEventListener('list-query', (event) => {
      if (event.key === this.key) {
        this._storeQuery(event.query);
      }
    });

    this.entity.addEventListener('update', (event) => {
      if (this._ids.includes(event.id)) {
        this.dispatchEvent(new ListUpdateEvent<T>(this));
      }
    });
  }

  // Methods
  private _storeQuery(query: AegisQuery<T[]>): void {
    this._query = new WeakRef(query);

    query.addEventListener('update', (event) => {
      if (event.state.status === 'completed') {
        this._ids = event.state.data.map((ent) => this._extractor(ent));
      }

      this.dispatchEvent(new ListUpdateEvent<T>(this));
    });

    this.dispatchEvent(new ListUpdateEvent<T>(this));
  }

  // Properties
  get data(): T[] {
    const data: T[] = [];

    for (const id of this._ids) {
      const ent = this.entity.store.get<T>(this.entity.name, id);

      if (ent) {
        data.push(ent);
      }
    }

    return data;
  }

  get isPending(): boolean {
    return this.lastQuery?.status === 'pending';
  }

  get lastQuery(): AegisQuery<T[]> | undefined {
    return this._query?.deref();
  }

  get lastError(): Error | undefined {
    if (this.lastQuery?.state?.status === 'error') {
      return this.lastQuery.state.data;
    }
  }
}
