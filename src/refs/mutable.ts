import { Awaitable } from '@jujulego/utils';

import { AsyncMutableRef, MutableRef, SyncMutableRef } from '../defs/index.js';
import { isPromise } from '../utils/promise.js';
import { AsyncRefFn, ref$, RefFn, SyncRefFn } from './ref.js';

// Types
export interface MutableOpts<T = unknown, M = T> {
  /**
   * Method to access data
   */
  read: RefFn<T>;

  /**
   * Method to mutate data. Should return new value to be emitter to listeners.
   * @param val
   */
  mutate(val: M): Awaitable<T>;
}

export interface SyncMutableOpts<T = unknown, M = T> {
  /**
   * Method to access data
   */
  read: SyncRefFn<T>;

  /**
   * Method to mutate data. Should return new stored value to be emitter to listeners.
   * @param val
   */
  mutate(val: M): T;
}

export interface AsyncMutableOpts<T = unknown, M = T> {
  /**
   * Method to access data
   */
  read: AsyncRefFn<T>;

  /**
   * Method to mutate data. Should return new stored value to be emitter to listeners.
   * @param val
   */
  mutate(val: M): PromiseLike<T>;
}

// Builder
export function mutable$<T, M = T>(opts: AsyncMutableOpts<T, M>): AsyncMutableRef<T, M>;
export function mutable$<T, M = T>(opts: SyncMutableOpts<T, M>): SyncMutableRef<T, M>;
export function mutable$<T, M = T>(opts: MutableOpts<T, M>): MutableRef<T, M>;

export function mutable$<T, M = T>(opts: MutableOpts<T, M>): MutableRef<T, M> {
  const ref = ref$<T>(opts.read);

  function emit(val: T) {
    ref.next(val);
    return val;
  }

  return Object.assign(ref, {
    mutate(arg: M) {
      const val = opts.mutate(arg);

      if (isPromise(val)) {
        return val.then(emit);
      } else {
        return emit(val);
      }
    }
  });
}
