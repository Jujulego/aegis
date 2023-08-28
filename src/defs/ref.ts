import { IEmitter, IObservable } from '@jujulego/event-tree';
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
export interface Ref<T = unknown> extends IEmitter<T>, IObservable<T> {
  /**
   * Return current value "pointed" by reference.
   */
  read(): Awaitable<T>;

  /**
   * Triggers listeners, to notify data changes.
   * @param data new value
   */
  next(data: T): void;
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
