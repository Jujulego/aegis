import { TypedEventTarget } from '../event-target';
import { AegisQuery, AegisQueryItem } from '../protocols';
import { AegisStore, StoreUpdateEvent } from '../stores';

import { AegisItem } from './item';
import { EntityUpdateEvent } from './entity-update.event';
import { EntityQueryEvent } from './entity-query.event';

// Entity
/**
 * Manages queries and data of a single entity
 */
export class AegisEntity<T> extends TypedEventTarget<EntityUpdateEvent<T> | EntityQueryEvent<T>> {
  // Attributes
  private readonly _queries = new Map<string, AegisQuery<T>>();

  // Constructor
  constructor(readonly name: string, readonly store: AegisStore) {
    super();

    // Transmit store events
    this.store.addEventListener('update', (event: StoreUpdateEvent<T>) => {
      if (event.entity === this.name) {
        this.dispatchEvent(new EntityUpdateEvent(this, event));
      }
    });
  }

  // Methods
  private _registerItemQuery(id: string, query: AegisQuery<T>): void {
    this._queries.set(id, query);

    // Store query result
    query.addEventListener('update', (event) => {
      if (event.state.status === 'completed') {
        this.store.set(this.name, id, event.state.data);
        this._queries.delete(id);
      }
    });

    // Dispatch query event
    this.dispatchEvent(new EntityQueryEvent(this, id, query));
  }

  /**
   * Return an AegisItem object for the entity's item with the given id
   * @param id
   */
  getItem(id: string): AegisItem<T> {
    return new AegisItem<T>(this, id, this._queries.get(id));
  }

  /**
   * Return an AegisItem object for the entity's item with the given id.
   * If no query is running for the asked item, it uses sender to refresh it.
   *
   * @param id
   * @param sender function used to send to query
   */
  queryItem(id: string, sender: AegisQueryItem<T>): AegisItem<T> {
    if (this._queries.get(id)?.status !== 'pending') {
      this._registerItemQuery(id, sender(id));
    }

    return this.getItem(id);
  }
}
