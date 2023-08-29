import { IEmitter, IObservable, source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import { IAsyncReadable, IReadable, ISyncReadable } from '../defs/index.js';
import { isPromise } from '../utils/promise.js';

// Types
export type RefFn<T = unknown> = () => Awaitable<T>;
export type SyncRefFn<T = unknown> = () => T;
export type AsyncRefFn<T = unknown> = () => PromiseLike<T>;

export type Ref<D, R extends IReadable<D> = IReadable<D>> = R & IEmitter<D> & IObservable<D>;
export type SyncRef<D> = Ref<D, ISyncReadable<D>>;
export type AsyncRef<D> = Ref<D, IAsyncReadable<D>>;

// Builder
export function ref$<T>(fn: AsyncRefFn<T>): AsyncRef<T>;
export function ref$<T>(fn: SyncRefFn<T>): SyncRef<T>;
export function ref$<T>(fn: RefFn<T>): Ref<T>;

export function ref$<T>(fn: RefFn<T>): Ref<T> {
  const events = source<T>();

  // Handle emits
  let last: T | undefined;

  function emit(val: T) {
    if (val !== last && val !== undefined) {
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
