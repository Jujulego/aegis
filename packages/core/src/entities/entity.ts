import { AegisQuery } from '../protocols';
import { AegisStore, StoreUpdateEvent } from '../stores';

import { AegisItem } from './item';

// Events
export class EntityUpdateEvent<T = unknown> extends Event {
  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly storeEvent: StoreUpdateEvent<T>,
  ) {
    super('update');
  }

  // Properties
  get id(): string {
    return this.storeEvent.id;
  }

  get newValue(): Readonly<T> {
    return this.storeEvent.newValue;
  }

  get oldValue(): Readonly<T> | undefined {
    return this.storeEvent.oldValue;
  }
}

export class EntityQueryEvent<T = unknown> extends Event {
  // Attributes
  type: 'query';

  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly id: string,
    readonly query: AegisQuery<T>,
  ) {
    super('query');
  }
}

export type EntityUpdateEventListener<T = unknown> = (event: EntityUpdateEvent<T>) => void;
export type EntityQueryEventListener<T = unknown> = (event: EntityQueryEvent<T>) => void;

// Entity
export interface AegisEntity<T> extends EventTarget {
  // Methods
  dispatchEvent(event: EntityUpdateEvent<T>): boolean;
  addEventListener(type: 'update', callback: EntityUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'update', callback: EntityUpdateEventListener<T>, options?: EventListenerOptions | boolean): void;

  dispatchEvent(event: EntityQueryEvent<T>): boolean;
  addEventListener(type: 'query', callback: EntityQueryEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'query', callback: EntityQueryEventListener<T>, options?: EventListenerOptions | boolean): void;
}

/**
 * Manages queries and data of a single entity
 */
export class AegisEntity<T> extends EventTarget {
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
   * Will update stored item with query result
   * @param id
   * @param query
   */
  registerItemMutation(id: string, query: AegisQuery<T>): void {
    // Store query result
    query.addEventListener('update', (event) => {
      if (event.state.status === 'completed') {
        this.store.set(this.name, id, event.state.data);
        this._queries.delete(id);
      }
    });
  }

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
      }
    });

    // Dispatch query event
    this.dispatchEvent(new EntityQueryEvent(this, id, query));
  }

  getItem(id: string): AegisItem<T> {
    return new AegisItem<T>(this, id);
  }
}
