import { TypedEventTarget } from '../event-target';
import { AegisQuery } from '../protocols';
import { AegisStore, StoreUpdateEvent } from '../stores';

import { AegisItem } from './item';
import { EntityUpdateEvent } from './entity-update.event';
import { EntityItemQueryEvent} from './entity-item-query.event';
import { EntityListQueryEvent } from './entity-list-query.event';
import { AegisList } from './list';

// Types
export type EntityIdExtractor<T> = (entity: T) => string;
export type EntityMerge<T, R> = (stored: T, result: R) => T;

// Entity
/**
 * Manages queries and data of a single entity
 */
export class AegisEntity<T> extends TypedEventTarget<EntityUpdateEvent<T> | EntityItemQueryEvent<T> | EntityListQueryEvent<T>> {
  // Attributes
  private readonly _extractor: EntityIdExtractor<T>;
  private readonly _itemQueries = new Map<string, AegisQuery<T>>();
  private readonly _listQueries = new Map<string, AegisQuery<T[]>>();

  // Constructor
  constructor(readonly name: string, readonly store: AegisStore, extractor: EntityIdExtractor<T>) {
    super();

    // Attributes
    this._extractor = extractor;

    // Transmit store events
    this.store.addEventListener('update', (event: StoreUpdateEvent<T>) => {
      if (event.entity === this.name) {
        this.dispatchEvent(new EntityUpdateEvent(this, event));
      }
    });
  }

  // Methods
  private _registerListQuery(key: string, query: AegisQuery<T[]>): void {
    this._listQueries.set(key, query);

    // Store query result
    query.addEventListener('update', (event) => {
      if (event.state.status === 'completed') {
        for (const ent of event.state.data) {
          this.store.set(this.name, this._extractor(ent), ent);
        }

        this._listQueries.delete(key);
      }
    });

    // Dispatch query event
    this.dispatchEvent(new EntityListQueryEvent(this, key, query));
  }

  private _registerItemQuery(id: string, query: AegisQuery<T>): void {
    this._itemQueries.set(id, query);

    // Store query result
    query.addEventListener('update', (event) => {
      if (event.state.status === 'completed') {
        this.store.set(this.name, id, event.state.data);
        this._itemQueries.delete(id);
      }
    });

    // Dispatch query event
    this.dispatchEvent(new EntityItemQueryEvent(this, id, query));
  }

  /**
   * Return an AegisItem object for the entity's item with the given id.
   *
   * @param id
   */
  getItem(id: string): AegisItem<T> {
    return new AegisItem<T>(this, id, this._itemQueries.get(id));
  }

  /**
   * Return an AegisList object for an entity list, identified by key.
   *
   * @param key
   */
  getList(key: string): AegisList<T> {
    return new AegisList<T>(this, key, this._extractor, this._listQueries.get(key));
  }

  /**
   * Return an AegisItem object for the entity's item with the given id.
   * If no query is running for the asked item, it uses sender to refresh it.
   *
   * @param id
   * @param sender function used to send to query
   */
  queryItem(id: string, sender: (id: string) => AegisQuery<T>): AegisItem<T> {
    if (this._itemQueries.get(id)?.status !== 'pending') {
      this._registerItemQuery(id, sender(id));
    }

    return this.getItem(id);
  }

  /**
   * Return an AegisList object for an entity list, identified by key
   * If a query is running for the asked list, cancels it
   * before using sender to initiate a new query.
   *
   * @param key
   * @param sender function used to send to query
   */
  queryList(key: string, sender: () => AegisQuery<T[]>): AegisList<T> {
    const query = this._listQueries.get(key);

    if (query?.status === 'pending') {
      query.cancel();
    }

    this._registerListQuery(key, sender());

    return this.getList(key);
  }

  /**
   * Register mutation query. Allow to update cached item by merging it
   * with request result
   *
   * @param id updated item's id
   * @param mutation query mutating the item
   * @param merge
   */
  updateItem<R>(id: string, mutation: AegisQuery<R>, merge: EntityMerge<T, R>): void {
    mutation.addEventListener('update', ({ state }) => {
      if (state.status === 'completed') {
        const item = this.store.get<T>(this.name, id);

        if (item) {
          this.store.set(this.name, id, merge(item, state.data));
        }
      }
    });
  }
}
