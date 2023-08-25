import { source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import { Ref } from '../defs/index.js';

// Types
export interface SyncRef<T = unknown> extends Ref {
  read(): T;
}

export interface AsyncRef<T = unknown> extends Ref {
  read(): PromiseLike<T>;
}

// Utils
export function isPromise<T>(obj: Awaitable<T>): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj !== null && 'then' in obj;
}

// Builder
export function ref$<T>(fn: () => PromiseLike<T>): AsyncRef<T>;
export function ref$<T>(fn: () => T): SyncRef<T>;

export function ref$<T>(fn: () => Awaitable<T>): Ref<T> {
  let data: T | undefined;
  const events = source<T>();

  function emit(res: T) {
    if (res !== data) {
      data = res;
      events.next(res);
    }

    return res;
  }

  return {
    // Events
    subscribe: events.subscribe,
    unsubscribe: events.unsubscribe,
    clear: events.clear,

    // Reference
    read(): Awaitable<T> {
      const res = fn();

      if (isPromise(res)) {
        return res.then(emit);
      } else {
        return emit(res);
      }
    }
  };
}
