import { AsyncReadable, MutableRef } from '../defs/index.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export type RefMapFn<K, D, R extends MutableRef<D>> = (key: K, value: D) => R;

export type RefIteratorValue<D, R extends MutableRef> = R extends AsyncReadable ? Promise<D> : D;
export type RefEntryIteratorValue<K, D, R extends MutableRef> = R extends AsyncReadable ? [K, Promise<D>] : [K, D];

export type RefIteratorResult<D, R extends MutableRef> = R extends AsyncReadable ? Promise<IteratorResult<D>> : IteratorResult<D>;

export interface RefIterator<D, R extends MutableRef> {
  next(): RefIteratorResult<D, R>;
}

export interface RefIterableIterator<D, R extends MutableRef> extends RefIterator<D, R> {
  [Symbol.asyncIterator](): AsyncIterableIterator<D>;
  [Symbol.iterator](): IterableIterator<RefIteratorValue<D, R>>;
}

export interface RefEntryIterableIterator<K, D, R extends MutableRef> extends RefIterator<[K, D], R> {
  [Symbol.asyncIterator](): AsyncIterableIterator<[K, D]>;
  [Symbol.iterator](): IterableIterator<RefEntryIteratorValue<K, D, R>>;
}

/**
 * Map storing data using mutable references.
 */
export class RefMap<K, D, R extends MutableRef<D>> {
  // Attributes
  private readonly _builder: RefMapFn<K, D, R>;
  private readonly _references = new Map<K, R>();

  // Constructor
  constructor(builder: RefMapFn<K, D, R>) {
    this._builder = builder;
  }

  // Methods
  get(key: K): R | null {
    return this._references.get(key) ?? null;
  }

  has(key: K): boolean {
    return this._references.has(key);
  }

  set(key: K, value: D): R {
    let ref = this._references.get(key);

    if (!ref) {
      ref = this._builder(key, value);
      this._references.set(key, ref);
    } else {
      ref.mutate(value);
    }

    return ref;
  }

  delete(key: K): boolean {
    return this._references.delete(key);
  }

  clear(): void {
    return this._references.clear();
  }

  keys() {
    return this._references.keys();
  }

  references() {
    return this._references.values();
  }

  values(): RefIterableIterator<D, R> {
    const refs = this._references.values();
    
    return {
      next(): RefIteratorResult<D, R> {
        const next = refs.next();

        if (next.done) {
          return next as RefIteratorResult<D, R>;
        } else {
          return awaitedCall((value: D) => ({ done: false, value }), next.value.read()) as RefIteratorResult<D, R>;
        }
      },
      [Symbol.asyncIterator]: () => ({
        async next() {
          const next = refs.next();

          if (next.done) {
            return next;
          } else {
            return { done: false, value: await next.value.read() };
          }
        },
        [Symbol.asyncIterator]() { return this; }
      }),
      [Symbol.iterator]: () => ({
        next() {
          const next = refs.next();

          if (next.done) {
            return next;
          } else {
            return { done: false, value: next.value.read() as RefIteratorValue<D, R> };
          }
        },
        [Symbol.iterator]() { return this; }
      })
    };
  }

  entries(): RefEntryIterableIterator<K, D, R> {
    const refs = this._references.entries();

    return {
      next(): RefIteratorResult<[K, D], R> {
        const next = refs.next();

        if (next.done) {
          return next as RefIteratorResult<[K, D], R>;
        } else {
          return awaitedCall((value: D) => ({ done: false, value: [next.value[0], value] }), next.value[1].read()) as RefIteratorResult<[K, D], R>;
        }
      },
      [Symbol.asyncIterator]: () => ({
        async next() {
          const next = refs.next();

          if (next.done) {
            return next;
          } else {
            return { done: false, value: [next.value[0], await next.value[1].read()] };
          }
        },
        [Symbol.asyncIterator]() { return this; }
      }),
      [Symbol.iterator]: () => ({
        next() {
          const next = refs.next();

          if (next.done) {
            return next;
          } else {
            return { done: false, value: [next.value[0], next.value[1].read()] as RefEntryIteratorValue<K, D, R> };
          }
        },
        [Symbol.iterator]() { return this; }
      })
    };
  }

  // Properties
  get size(): number {
    return this._references.size;
  }
}

export function map$<K, D, R extends MutableRef<D>>(fn: RefMapFn<K, D, R>): RefMap<K, D, R> {
  return new RefMap(fn);
}