import { EventEmitter, EventListener, EventListenerOptions, EventUnsubscribe } from '../events';
import { AegisItem } from '../items';
import { AegisList } from '../lists';
import { AegisStore, StoreUpdateEvent } from '../stores';
import { AegisQuery } from '../protocols';

// Types
export type EntityIdExtractor<T> = (entity: T) => string;
export type EntityMerge<T, R> = (stored: T, result: R) => T;

// Class
export class AegisEntity<T> implements EventEmitter {
  // Attributes
  private readonly _items = new Map<string, WeakRef<AegisItem<T>>>();
  private readonly _lists = new Map<string, WeakRef<AegisList<T>>>();

  // Constructor
  constructor(
    readonly name: string,
    readonly store: AegisStore,
    readonly extractor: EntityIdExtractor<T>
  ) {}

  // Methods
  // - events
  subscribe(
    type: 'update',
    listener: EventListener<StoreUpdateEvent<T>>,
    opts: Omit<EventListenerOptions<StoreUpdateEvent<T>>, 'key'> & { key?: [string] } = {}
  ): EventUnsubscribe {
    const { key = [] } = opts;
    return this.store.subscribe('update', listener, { ...opts, key: [this.name, ...key] });
  }

  // - query managers
  /**
   * Get item manager by id
   * @param id
   */
  item(id: string): AegisItem<T> {
    let item = this._items.get(id)?.deref();

    if (!item) {
      item = new AegisItem(this, id);
      this._items.set(id, new WeakRef(item));
    }

    return item;
  }

  /**
   * Get list manager by key
   * @param key
   */
  list(key: string): AegisList<T> {
    let list = this._lists.get(key)?.deref();

    if (!list) {
      list = new AegisList(this, key);
      this._lists.set(key, new WeakRef(list));
    }

    return list;
  }

  // - queries
  /**
   * Will resolves to item manager for returned item
   * @param query
   */
  query(query: AegisQuery<T>): AegisQuery<AegisItem<T>> {
    return query.then((item) => this.item(this.storeItem(item)));
  }

  /**
   * Register a mutation. Query result will replace stored item.
   * @param id
   * @param query
   */
  mutation(id: string, query: AegisQuery<T>): AegisQuery<T>;

  /**
   * Register a mutation. Query result will be merged with stored item.
   * Resolved to the result of the merge.
   * @param id
   * @param query
   * @param merge
   */
  mutation<R>(id: string, query: AegisQuery<R>, merge: EntityMerge<T, R>): AegisQuery<T>;

  mutation<R>(id: string, query: AegisQuery<unknown>, merge?: EntityMerge<T, R>): AegisQuery<T> {
    return query.then((result) => {
      const item = this.getItem(id);

      if (merge) {
        if (!item) {
          throw new Error(`Unknown mutated item ${this.name}.${id}`);
        }

        const updated = merge(item, result as R);
        this.setItem(id, updated);

        return updated;
      } else {
        this.setItem(id, result as T);

        return result as T;
      }
    });
  }

  /**
   * Deletes the item in store as soon as the query completes.
   * Returns deleted item from store.
   * @param id
   * @param query
   */
  deletion(id: string, query: AegisQuery<unknown>): AegisQuery<T | undefined> {
    return query.then(() => this.store.delete(this.name, id));
  }

  // - store access
  /**
   * Direct access to stored item, by id.
   * @param id
   */
  getItem(id: string): T | undefined {
    return this.store.get(this.name, id);
  }

  /**
   * Local item update, by id.
   * @param id
   * @param value
   */
  setItem(id: string, value: T): void {
    this.store.set(this.name, id, value);
  }

  /**
   * Stores given item. Uses extractor to get item's id.
   * Returns item's id.
   *
   * @param item
   */
  storeItem(item: T): string {
    const id = this.extractor(item);
    this.setItem(id, item);

    return id;
  }
}
