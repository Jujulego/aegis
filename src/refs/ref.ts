import { source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import { AsyncRef, Ref, SyncRef } from '../defs/index.js';

// Types
export type SyncRefFn<T = unknown> = () => T;
export type AsyncRefFn<T = unknown> = () => PromiseLike<T>;
export type RefFn<T = unknown> = () => Awaitable<T>;

// Utils
export function isPromise<T>(obj: Awaitable<T>): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj !== null && 'then' in obj;
}

// Builder
export function ref$<T>(fn: AsyncRefFn<T>): AsyncRef<T>;
export function ref$<T>(fn: SyncRefFn<T>): SyncRef<T>;
export function ref$<T>(fn: RefFn<T>): Ref<T>;

export function ref$<T>(fn: RefFn<T>): Ref<T> {
  const events = source<T>();

  // Handle emits
  let last: T | undefined;

  function emit(val: T) {
    if (last !== val) {
      last = val;
      events.next(val);
    }

    return val;
  }

  return {
    // Events
    subscribe: events.subscribe,
    unsubscribe: events.unsubscribe,
    clear: events.clear,

    // Reference
    next: (val: T) => void emit(val),
    read(): Awaitable<T> {
      const val = fn();

      if (isPromise(val)) {
        return val.then(emit);
      } else {
        return emit(val);
      }
    }
  };
}
