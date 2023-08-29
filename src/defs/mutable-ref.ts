import { Awaitable } from '@jujulego/utils';

import { Ref } from './ref.js';

/**
 * Observable mutable reference.
 */
export interface MutableRef<T = unknown, M = T> extends Ref<T> {
  /**
   * Updates value "pointed" by reference, returns updated value.
   */
  mutate(val: M): Awaitable<T>;
}

/**
 * Synchronous mutable reference.
 */
export interface SyncMutableRef<T = unknown, M = T> extends MutableRef<T, M> {
  read(): T;
}

/**
 * Asynchronous mutable reference.
 */
export interface AsyncMutableRef<T = unknown, M = T> extends MutableRef<T, M> {
  read(): PromiseLike<T>;
}
