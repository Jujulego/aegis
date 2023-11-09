import { AsyncReadable, MutableRef } from '../defs/index.js';
import { asyncIterMapper, iterMapper, yieldMapper } from '../utils/iterator.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export type RefMapFn<K, D, R extends MutableRef<D>> = (key: K, value: D) => R;

export type RefIteratorValue<D, R extends MutableRef> = R extends AsyncReadable ? Promise<D> : D;

export type RefIteratorResult<D, R extends MutableRef> = R extends AsyncReadable ? Promise<IteratorResult<D>> : IteratorResult<D>;

export interface RefIterator<D, R extends MutableRef> {
  next(): RefIteratorResult<D, R>;
}

export interface RefIterableIterator<D, R extends MutableRef> extends RefIterator<D, R> {
  [Symbol.asyncIterator](): AsyncIterableIterator<D>;
  [Symbol.iterator](): IterableIterator<RefIteratorValue<D, R>>;
}

export type RefEntryIteratorValue<K, D, R extends MutableRef> = [K, RefIteratorValue<D, R>];

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
      next: yieldMapper(refs, (ref) => awaitedCall((value: D) => ({ value }), ref.read())),
      [Symbol.asyncIterator]: () => asyncIterMapper(refs, async (ref) => ({ value: await ref.read() })),
      [Symbol.iterator]: () => iterMapper(refs, (ref) => ({ value: ref.read() })),
    } as RefIterableIterator<D, R>;
  }

  entries(): RefEntryIterableIterator<K, D, R> {
    const refs = this._references.entries();

    return {
      next: yieldMapper(refs, ([key, ref]) => awaitedCall((value: D) => ({ value: [key, value] }), ref.read())),
      [Symbol.asyncIterator]: () => asyncIterMapper(refs, async ([key, ref]) => ({ value: [key, await ref.read()] })),
      [Symbol.iterator]: () => iterMapper(refs, ([key, ref]) => ({ value: [key, ref.read()] })),
    } as RefEntryIterableIterator<K, D, R>;
  }

  // Properties
  get size(): number {
    return this._references.size;
  }
}

export function map$<K, D, R extends MutableRef<D>>(fn: RefMapFn<K, D, R>): RefMap<K, D, R> {
  return new RefMap(fn);
}