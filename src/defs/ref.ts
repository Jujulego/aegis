import { IObservable } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import { ReadonlyRef } from './readonly-ref.js';

/**
 * Updatable reference
 * @deprecated
 */
export interface OldRef<D = unknown> extends ReadonlyRef<D> {
  // Methods
  update(data: D): void;
}

/**
 * Observable reference.
 */
export interface Ref<T = unknown> extends IObservable<T> {
  /**
   * Return current value "pointed" by reference.
   */
  read(): Awaitable<T>;
}

/**
 * Observable mutable reference.
 */
export interface MutableRef<T = unknown> extends Ref<T> {
  /**
   * Updates value "pointed" by reference.
   */
  mutate(val: T): Awaitable<void>;
}
