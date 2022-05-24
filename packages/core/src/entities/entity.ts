import { TypedEventTarget } from '../event-target';
import { AegisQuery } from '../protocols';
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
  /**
   * Will update stored item with query result, and keep it to track pending status & error
   * @param id
   * @param query
   */
  registerItemQuery(id: string, query: AegisQuery<T>): void {
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

  getItem(id: string): AegisItem<T> {
    return new AegisItem<T>(this, id, this._queries.get(id));
  }
}
