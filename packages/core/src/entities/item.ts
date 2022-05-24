import { AegisQuery, QueryState, QueryStatus } from '../protocols';

import { AegisEntity, EntityUpdateEvent } from './entity';

// Events
export class ItemUpdateEvent<T = unknown> extends Event {
  // Constructor
  constructor(
    readonly item: AegisItem<T>,
    readonly entityEvent: EntityUpdateEvent<T>,
  ) {
    super('update');
  }

  // Properties
  get entity(): AegisEntity<T> {
    return this.item.entity;
  }

  get newValue(): Readonly<T> {
    return this.entityEvent.newValue;
  }

  get oldValue(): Readonly<T> | undefined {
    return this.entityEvent.oldValue;
  }
}

export class ItemQueryEvent<T = unknown> extends Event {
  // Attributes
  type: 'query';

  // Constructor
  constructor(
    readonly item: AegisItem<T>,
    readonly query: AegisQuery<T>,
  ) {
    super('query');
  }

  // Properties
  get entity(): AegisEntity<T> {
    return this.item.entity;
  }

  get status(): QueryStatus {
    return this.query.status;
  }

  get state(): Readonly<QueryState<T>> {
    return this.query.state;
  }
}

export type ItemUpdateEventListener<T = unknown> = (event: ItemUpdateEvent<T>) => void;
export type ItemQueryEventListener<T = unknown> = (event: ItemQueryEvent<T>) => void;

// Item
export interface AegisItem<T> extends EventTarget {
  // Methods
  dispatchEvent(event: EntityUpdateEvent<T>): boolean;
  addEventListener(type: 'update', callback: ItemUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'update', callback: ItemUpdateEventListener<T>, options?: EventListenerOptions | boolean): void;

  dispatchEvent(event: ItemQueryEvent<T>): boolean;
  addEventListener(type: 'query', callback: ItemQueryEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'query', callback: ItemQueryEventListener<T>, options?: EventListenerOptions | boolean): void;
}

export class AegisItem<T> extends EventTarget {
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
