import { source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import { AsyncMutableRef, AsyncRef, MutableRef, Ref, SyncMutableRef, SyncRef } from '../defs/index.js';

// Types
export type SyncRefFn<T> = () => T;
export type AsyncRefFn<T> = () => PromiseLike<T>;
export type RefFn<T> = () => Awaitable<T>;

export interface SyncRefOpts<T> {
  read: SyncRefFn<T>;
}

export interface SyncMutableRefOpts<T> extends SyncRefOpts<T> {
  mutate(value: T): T;
}

export interface AsyncRefOpts<T> {
  read: AsyncRefFn<T>;
}

export interface AsyncMutableRefOpts<T> extends AsyncRefOpts<T> {
  mutate(value: T): PromiseLike<T>;
}

export interface RefOpts<T> {
  read: RefFn<T>;
}

export interface MutableRefOpts<T> extends RefOpts<T> {
  mutate(value: T): Awaitable<T>;
}

type RefArg<T> = RefFn<T> | RefOpts<T> | MutableRefOpts<T>;

// Utils
export function isPromise<T>(obj: Awaitable<T>): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj !== null && 'then' in obj;
}

function parseArg<T>(arg: RefFn<T> | RefOpts<T> | RefOpts<T> & MutableRefOpts<T>): RefOpts<T> | MutableRefOpts<T> {
  if (typeof arg === 'function') {
    return { read: arg };
  }

  return arg;
}

// Builder
export function ref$<T>(fn: AsyncRefFn<T>): AsyncRef<T>;
export function ref$<T>(opts: AsyncRefOpts<T>): AsyncRef<T>;
export function ref$<T>(opts: AsyncMutableRefOpts<T>): AsyncMutableRef<T>;

export function ref$<T>(fn: SyncRefFn<T>): SyncRef<T>;
export function ref$<T>(opts: SyncRefOpts<T>): SyncRef<T>;
export function ref$<T>(opts: SyncMutableRefOpts<T>): SyncMutableRef<T>;

export function ref$<T>(fn: RefFn<T>): Ref<T>;
export function ref$<T>(opts: RefOpts<T>): Ref<T>;
export function ref$<T>(opts: RefOpts<T> & MutableRefOpts<T>): MutableRef<T>;

export function ref$<T>(arg: RefArg<T>): Ref<T> | MutableRef<T> {
  const opts = parseArg(arg);

  let last: T | undefined;
  const events = source<T>();

  function emit(res: T) {
    if (res !== last) {
      last = res;
      events.next(res);
    }

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
      mutate(value: T) {
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
