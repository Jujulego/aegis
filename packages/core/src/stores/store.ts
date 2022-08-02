import { EventSource } from '../events';

// Types
export interface StoreUpdateEvent<D = any> {
  id: string;
  old?: Readonly<D>;
  new: Readonly<D>;
}

export type StoreEventMap<D = any> = Record<`update.${string}.${string}`, StoreUpdateEvent<D>>;

// Store
/**
 * Store abstract class. Each store must extends this.
 *
 * Implementation conditions:
 * - 2 consecutive calls of `Store.get` must return the same object
 * - each time an item is updated, the store must emit an update event
 *
 * Events emitted:
 * - 'update.\{entity\}.\{id\}' emitted when an item is updated
 */
export abstract class Store extends EventSource<StoreEventMap> {
  // Methods
  /**
   * Returns an entity's item, if stored or `undefined` if item is unknown.
   *
   * @param entity
   * @param id
   */
  abstract get<T>(entity: string, id: string): T | undefined;

  /**
   * Updates an entity's item, if stored or adds it to the store.
   * Returns previously stored data, `undefined` when item is added
   *
   * @param entity
   * @param id
   * @param data new items content
   */
  abstract set<T>(entity: string, id: string, data: T): T | undefined;

  /**
   * Deletes an entity's item. Next {@link Store.get} call should return `undefined`
   * Returns previously stored data, `undefined` when item did not exist before.
   *
   * @param entity
   * @param id
   */
  abstract delete<T>(entity: string, id: string): T | undefined;
}
