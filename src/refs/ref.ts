import { source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import {
  AsyncMutable,
  AsyncMutableRef,
  AsyncReadable, AsyncRef,
  Mutable, MutableRef,
  Readable, Ref,
  SyncMutable, SyncMutableRef,
  SyncReadable, SyncRef
} from '../defs/index.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export type RefFn<D = unknown> = () => Awaitable<D>;
export type SyncRefFn<D = unknown> = () => D;
export type AsyncRefFn<D = unknown> = () => PromiseLike<D>;

export type RefOpts<D = unknown, A = D> = Readable<D> & Partial<Mutable<D, A>>

// Utils
function parseArg<D, A>(arg: RefFn<D> | RefOpts<D, A>): RefOpts<D, A> {
  return typeof arg === 'function' ? { read: arg } : arg;
}

// Builder
export function ref$<D, A = D>(opts: AsyncReadable<D> & AsyncMutable<D, A>): AsyncMutableRef<D, A>;
export function ref$<D, A = D>(opts: AsyncReadable<D> & SyncMutable<D, A>): MutableRef<D, A, AsyncReadable<D>, SyncMutable<D, A>>;
export function ref$<D, A = D>(opts: AsyncReadable<D> & Mutable<D, A>): MutableRef<D, A, AsyncReadable<D>, Mutable<D, A>>;

export function ref$<D, A = D>(opts: SyncReadable<D> & AsyncMutable<D, A>): MutableRef<D, A, SyncReadable<D>, AsyncMutable<D, A>>;
export function ref$<D, A = D>(opts: SyncReadable<D> & SyncMutable<D, A>): SyncMutableRef<D, A>;
export function ref$<D, A = D>(opts: SyncReadable<D> & Mutable<D, A>): MutableRef<D, A, SyncReadable<D>, Mutable<D, A>>;

export function ref$<D, A = D>(opts: Readable<D> & AsyncMutable<D, A>): MutableRef<D, A, Readable<D>, AsyncMutable<D, A>>;
export function ref$<D, A = D>(opts: Readable<D> & SyncMutable<D, A>): MutableRef<D, A, Readable<D>, SyncMutable<D, A>>;
export function ref$<D, A = D>(opts: Readable<D> & Mutable<D, A>): MutableRef<D, A>;

export function ref$<D>(opts: AsyncReadable<D>): AsyncRef<D>;
export function ref$<D>(opts: SyncReadable<D>): SyncRef<D>;
export function ref$<D>(opts: Readable<D>): Ref<D>;

export function ref$<D>(fn: AsyncRefFn<D>): AsyncRef<D>;
export function ref$<D>(fn: SyncRefFn<D>): SyncRef<D>;
export function ref$<D>(fn: RefFn<D>): Ref<D>;

export function ref$<D, A>(opts: RefOpts<D, A>): Ref<D>;

export function ref$<D, A>(arg: RefFn<D> | RefOpts<D, A>): Ref<D> {
  const opts = parseArg<D, A>(arg);
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

  const ref = {
    // Events
    subscribe: events.subscribe,
    unsubscribe: events.unsubscribe,
    clear: events.clear,

    // Reference
    next: (val: D) => void emit(val),
    read: () => awaitedCall(emit, opts.read())
  };

  // Add options ;)
  if ('mutate' in opts) {
    return Object.assign(ref, {
      mutate: (arg: A) => awaitedCall(emit, opts.mutate!(arg))
    });
  }

  return ref;
}
