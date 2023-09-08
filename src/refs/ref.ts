import { IEmitter, IObservable, source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import { AsyncReadable, Readable, SyncReadable } from '../defs/index.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export type RefFn<D = unknown> = () => Awaitable<D>;
export type SyncRefFn<D = unknown> = () => D;
export type AsyncRefFn<D = unknown> = () => PromiseLike<D>;

export type Ref<D = unknown, R extends Readable<D> = Readable<D>> = R & IEmitter<D> & IObservable<D>;
export type SyncRef<D = unknown> = Ref<D, SyncReadable<D>>;
export type AsyncRef<D = unknown> = Ref<D, AsyncReadable<D>>;

// Builder
export function ref$<D>(fn: AsyncRefFn<D>): AsyncRef<D>;
export function ref$<D>(fn: SyncRefFn<D>): SyncRef<D>;
export function ref$<D>(fn: RefFn<D>): Ref<D>;

export function ref$<D>(fn: RefFn<D>): Ref<D> {
  const events = source<D>();

  // Handle emits
  let last: D | undefined;

  function emit(val: D) {
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
    next: (val: D) => void emit(val),
    read: () => awaitedCall(fn(), emit)
  };
}
