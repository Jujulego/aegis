import { EventSource } from '../events';

// Types
export interface StoreUpdateEvent<D = any> {
  id: string;
  old?: D;
  new: D;
}

export interface StoreDeleteEvent<D = any> {
  id: string;
  item: D;
}

export type StoreEventMap<D = any> = Record<`update.${string}.${string}`, StoreUpdateEvent<D>>
  & Record<`delete.${string}.${string}`, StoreDeleteEvent<D>>;

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
 * - 'delete.\{entity\}.\{id\}' emitted when an item is deleted
 */
export abstract class Store extends EventSource<StoreEventMap> {
  // Methods
  /**
   * Returns an entity's item, if stored or `undefined` if item is unknown.
   *
   * @param entity
   * @param id
   */
  abstract get<D>(entity: string, id: string): D | undefined;

  /**
   * Updates an entity's item, if stored or adds it to the store.
   * Returns previously stored data, `undefined` when item is added
   *
   * @param entity
   * @param id
   * @param data new items content
   */
  abstract set<D>(entity: string, id: string, data: D): D | undefined;

  /**
   * Deletes an entity's item. Next {@link Store.get} call should return `undefined`
   * Returns previously stored data, `undefined` when item did not exist before.
   *
   * @param entity
   * @param id
   */
  abstract delete<D>(entity: string, id: string): D | undefined;
}
