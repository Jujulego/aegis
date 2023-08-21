import { ReadonlyRef } from './readonly-ref';

/**
 * Updatable reference
 */
export interface Ref<D> extends ReadonlyRef<D> {
  // Methods
  update(data: D): void;
}
