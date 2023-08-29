import { ReadonlyRef } from './readonly-ref.js';

/**
 * Updatable reference
 * @deprecated
 */
export interface OldRef<D = unknown> extends ReadonlyRef<D> {
  // Methods
  update(data: D): void;
}
