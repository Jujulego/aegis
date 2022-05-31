import { TypedEventTarget } from '../event-target';
import { AegisQuery } from '../protocols';

import { AegisEntity } from './entity';
import { ItemUpdateEvent } from './item-update.event';

// Item
export class AegisItem<T> extends TypedEventTarget<ItemUpdateEvent<T>> {
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
    this.entity.addEventListener('item-query', (event) => {
      if (event.id === this.id) {
        this._storeQuery(event.query);
      }
    });

    this.entity.addEventListener('update', (event) => {
      if (event.id === this.id) {
        this.dispatchEvent(new ItemUpdateEvent<T>(this));
      }
    });
  }

  // Methods
  private _storeQuery(query: AegisQuery<T>): void {
    this._query = new WeakRef(query);

    query.addEventListener('update', () => {
      this.dispatchEvent(new ItemUpdateEvent<T>(this));
    });

    this.dispatchEvent(new ItemUpdateEvent<T>(this));
  }

  // Properties
  get data(): T | undefined {
    return this.entity.store.get<T>(this.entity.name, this.id);
  }

  get isPending(): boolean {
    return this.lastQuery?.status === 'pending';
  }

  get lastQuery(): AegisQuery<T> | undefined {
    return this._query?.deref();
  }

  get lastError(): Error | undefined {
    if (this.lastQuery?.state?.status === 'error') {
      return this.lastQuery.state.data;
    }
  }
}
