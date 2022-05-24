import { AegisQuery } from '../protocols';

import { AegisEntity } from './entity';
import { TypedEventTarget } from '../event-target';
import { ItemUpdateEvent } from './item-update.event';
import { ItemQueryEvent } from './item-query.event';

// Item
export class AegisItem<T> extends TypedEventTarget<ItemUpdateEvent<T> | ItemQueryEvent<T>> {
  // Attributes
  private _query?: WeakRef<AegisQuery<T>>;

  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly id: string,
    query?: AegisQuery<T>,
  ) {
    super();

    // Store query ref
    if (query) {
      this._storeQuery(query);
    }

    // Listen for query update
    this.entity.addEventListener('query', (event) => {
      this._storeQuery(event.query);
    });
  }

  // Methods
  private _storeQuery(query: AegisQuery<T>): void {
    this._query = new WeakRef(query);

    query.addEventListener('update', () => {
      this.dispatchEvent(new ItemQueryEvent<T>(this, query));
    });

    this.dispatchEvent(new ItemQueryEvent<T>(this, query));
  }

  // Properties
  get lastQuery(): AegisQuery<T> | undefined {
    return this._query?.deref();
  }

  get data() {
    return this.entity.store.get<T>(this.entity.name, this.id);
  }

  get isPending() {
    return this.lastQuery?.status === 'pending';
  }

  get lastError() {
    if (this.lastQuery?.state?.status === 'error') {
      return this.lastQuery.state.data;
    }
  }
}
