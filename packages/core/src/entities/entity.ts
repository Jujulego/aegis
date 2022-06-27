import { EventListener, EventListenerOptions, EventUnsubscribe } from '../events';
import { AegisQuery } from '../protocols';
import { AegisStore, StoreEventMap } from '../stores';
import { PartialKey, StringKey } from '../utils';

import { AegisItem } from './item';
import { AegisList } from './list';

// Types
export type EntityIdExtractor<D> = (entity: D) => string;
export type EntityMerge<D, R> = (stored: D, result: R) => D;

// Class
export class AegisEntity<D> {
  // Attributes
  private readonly _items = new Map<string, WeakRef<AegisItem<D>>>();
  private readonly _lists = new Map<string, WeakRef<AegisList<D>>>();

  // Constructor
  constructor(
    readonly name: string,
    readonly store: AegisStore,
    readonly extractor: EntityIdExtractor<D>
  ) {}

  // Methods
  // - events
  subscribe(
    key: StringKey<PartialKey<['update', string]>>,
    listener: EventListener<StoreEventMap<D>, 'update'>,
    opts?: EventListenerOptions
  ): EventUnsubscribe {
    const [type, ...filters] = key.split('.');

    return this.store.subscribe<'update'>(
      [type, this.name, ...filters].join('.') as StringKey<PartialKey<['update', string, string]>>,
      listener,
      opts
    );
  }

  // - query managers
  /**
   * Get item manager by id
   * @param id
   */
  item(id: string): AegisItem<D> {
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
  list(key: string): AegisList<D> {
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
  query(query: AegisQuery<D>): AegisQuery<AegisItem<D>> {
    return query.then((item) => this.item(this.storeItem(item)));
  }

  /**
   * Register a mutation. Query result will replace stored item.
   * @param id
   * @param query
   */
  mutation(id: string, query: AegisQuery<D>): AegisQuery<D>;

  /**
   * Register a mutation. Query result will be merged with stored item.
   * Resolved to the result of the merge.
   * @param id
   * @param query
   * @param merge
   */
  mutation<R>(id: string, query: AegisQuery<R>, merge: EntityMerge<D, R>): AegisQuery<D>;

  mutation(id: string, query: AegisQuery<unknown>, merge?: EntityMerge<D, unknown>): AegisQuery<D> {
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
  deletion(id: string, query: AegisQuery<unknown>): AegisQuery<D | undefined> {
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
