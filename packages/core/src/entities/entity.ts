import { EventListener, EventListenerOptions, EventUnsubscribe } from '../events';
import { Query } from '../protocols';
import { Store, StoreEventMap } from '../stores';
import { PartialKey } from '../utils';

import { Item } from './item';
import { List } from './list';

// Types
export type EntityIdExtractor<D> = (entity: D) => string;
export type EntityMerge<D, R> = (stored: D, result: R) => D;

// Class
export class Entity<D> {
  // Attributes
  private readonly _items = new Map<string, WeakRef<Item<D>>>();
  private readonly _lists = new Map<string, WeakRef<List<D>>>();

  // Constructor
  constructor(
    readonly name: string,
    readonly store: Store,
    readonly extractor: EntityIdExtractor<D>
  ) {}

  // Methods
  // - events
  subscribe(
    key: PartialKey<`update.${string}`>,
    listener: EventListener<StoreEventMap<D>, `update.${string}.${string}`>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    const [type, ...filters] = key.split('.');

    return this.store.subscribe(
      [type, this.name, ...filters].join('.') as PartialKey<`update.${string}.${string}`>,
      listener,
      opts
    );
  }

  // - query managers
  /**
   * Get item manager by id
   * @param id
   */
  item(id: string): Item<D> {
    let item = this._items.get(id)?.deref();

    if (!item) {
      item = new Item(this, id);
      this._items.set(id, new WeakRef(item));
    }

    return item;
  }

  /**
   * Get list manager by key
   * @param key
   */
  list(key: string): List<D> {
    let list = this._lists.get(key)?.deref();

    if (!list) {
      list = new List(this, key);
      this._lists.set(key, new WeakRef(list));
    }

    return list;
  }

  // - queries
  /**
   * Will resolves to item manager for returned item
   * @param query
   */
  query(query: Query<D>): Query<Item<D>> {
    return query.then((item) => this.item(this.storeItem(item)));
  }

  /**
   * Register a mutation. Query result will replace stored item.
   * @param id
   * @param query
   */
  mutation(id: string, query: Query<D>): Query<D>;

  /**
   * Register a mutation. Query result will be merged with stored item.
   * Resolved to the result of the merge.
   * @param id
   * @param query
   * @param merge
   */
  mutation<R>(id: string, query: Query<R>, merge: EntityMerge<D, R>): Query<D>;

  mutation(id: string, query: Query<unknown>, merge?: EntityMerge<D, unknown>): Query<D> {
    return query.then((result) => {
      if (merge) {
        const item = this.getItem(id);

        if (!item) {
          throw new Error(`Unknown mutated item ${this.name}.${id}`);
        }

        const updated = merge(item, result);
        this.setItem(id, updated);

        return updated;
      } else {
        this.setItem(id, result as D);

        return result as D;
      }
    });
  }

  /**
   * Deletes the item in store as soon as the query completes.
   * Returns deleted item from store.
   * @param id
   * @param query
   */
  deletion(id: string, query: Query<unknown>): Query<D | undefined> {
    return query.then(() => this.deleteItem(id));
  }

  // - store access
  /**
   * Direct access to stored item, by id.
   * @param id
   */
  getItem(id: string): D | undefined {
    return this.store.get(this.name, id);
  }

  /**
   * Update local item, by id.
   * @param id
   * @param value
   */
  setItem(id: string, value: D): void {
    this.store.set(this.name, id, value);
  }

  /**
   * Delete local item, by id.
   * @param id
   */
  deleteItem(id: string): D | undefined {
    return this.store.delete(this.name, id);
  }

  /**
   * Stores given item. Uses extractor to get item's id.
   * Returns item's id.
   *
   * @param item
   */
  storeItem(item: D): string {
    const id = this.extractor(item);
    this.setItem(id, item);

    return id;
  }
}
