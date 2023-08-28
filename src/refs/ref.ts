import { source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import { AsyncMutableRef, AsyncRef, MutableRef, Ref, SyncMutableRef, SyncRef } from '../defs/index.js';

// Types
export type SyncRefFn<T = unknown> = () => T;
export type AsyncRefFn<T = unknown> = () => PromiseLike<T>;
export type RefFn<T = unknown> = () => Awaitable<T>;

export interface SyncRefOpts<T = unknown> {
  read: SyncRefFn<T>;
}

export interface SyncMutableRefOpts<T = unknown, M = T> extends SyncRefOpts<T> {
  mutate(value: M): T;
}

export interface AsyncRefOpts<T = unknown> {
  read: AsyncRefFn<T>;
}

export interface AsyncMutableRefOpts<T = unknown, M = T> extends AsyncRefOpts<T> {
  mutate(value: M): PromiseLike<T>;
}

export interface RefOpts<T = unknown> {
  read: RefFn<T>;
}

export interface MutableRefOpts<T = unknown, M = T> extends RefOpts<T> {
  mutate(value: M): Awaitable<T>;
}

type RefArg<T, M = T> = RefFn<T> | RefOpts<T> | MutableRefOpts<T, M>;

// Utils
export function isPromise<T>(obj: Awaitable<T>): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj !== null && 'then' in obj;
}

function parseArg<T, M = T>(arg: RefArg<T, M>): RefOpts<T> | MutableRefOpts<T, M> {
  if (typeof arg === 'function') {
    return { read: arg };
  }

  return arg;
}

// Builder
export function ref$<T>(fn: AsyncRefFn<T>): AsyncRef<T>;
export function ref$<T>(opts: AsyncRefOpts<T>): AsyncRef<T>;
export function ref$<T, M = T>(opts: AsyncMutableRefOpts<T, M>): AsyncMutableRef<T, M>;

export function ref$<T>(fn: SyncRefFn<T>): SyncRef<T>;
export function ref$<T>(opts: SyncRefOpts<T>): SyncRef<T>;
export function ref$<T, M = T>(opts: SyncMutableRefOpts<T, M>): SyncMutableRef<T, M>;

export function ref$<T>(fn: RefFn<T>): Ref<T>;
export function ref$<T>(opts: RefOpts<T>): Ref<T>;
export function ref$<T, M = T>(opts: MutableRefOpts<T, M>): MutableRef<T, M>;

export function ref$<T, M = T>(arg: RefArg<T, M>): Ref<T> | MutableRef<T, M> {
  const opts = parseArg(arg);

  const events = source<T>();

  function emit(res: T) {
    events.next(res);
    return res;
  }

  const ref = {
    // Events
    subscribe: events.subscribe,
    unsubscribe: events.unsubscribe,
    clear: events.clear,

    // Reference
    read(): Awaitable<T> {
      const res = opts.read();

      if (isPromise(res)) {
        return res.then(emit);
      } else {
        return emit(res);
      }
    }
  };

  if ('mutate' in opts) {
    return Object.assign(ref, {
      mutate(value: M) {
        const res = opts.mutate!(value);

        if (isPromise(res)) {
          return res.then(emit);
        } else {
          return emit(res);
        }
      }
    });
  }

  return ref;
}
