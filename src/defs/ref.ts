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
 * Generic observable reference.
 */
export interface Ref<T = unknown> extends IObservable<T> {
  /**
   * Return current value "pointed" by reference.
   */
  read(): Awaitable<T>;
}

/**
 * Synchronous observable reference.
 */
export interface SyncRef<T = unknown> extends Ref<T> {
  read(): T;
}

/**
 * Asynchronous observable reference.
 */
export interface AsyncRef<T = unknown> extends Ref<T> {
  read(): PromiseLike<T>;
}

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
