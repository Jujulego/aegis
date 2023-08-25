import { ReadonlyRef } from './readonly-ref.js';

/**
 * Updatable reference
 */
export interface Ref<D = unknown> extends ReadonlyRef<D> {
  // Methods
  update(data: D): void;
}
