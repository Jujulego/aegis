import { MutableRef, SyncMutableRef } from '../defs/index.js';

// Types
export type MapFn<K, D, R extends MutableRef<D>> = (key: K, value: D) => R;

/**
 * Map storing data using mutable references.
 */
export class RefMap<K, D, R extends MutableRef<D>> {
  // Attributes
  private readonly _builder: MapFn<K, D, R>;
  private readonly _references = new Map<K, R>();

  // Constructor
  constructor(builder: MapFn<K, D, R>) {
    this._builder = builder;
  }

  // Methods
  get(key: K): R | undefined {
    return this._references.get(key);
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

  // Properties
  get size(): number {
    return this._references.size;
  }
}

/**
 * Map of references with asynchronous iterators on values
 */
export class AsyncRefMap<K, D, R extends MutableRef<D>> extends RefMap<K, D, R> {
  // Methods
  async *values(): AsyncGenerator<D> {
    for (const ref of this.references()) {
      yield await ref.read();
    }
  }

  async *entries(): AsyncGenerator<[K, D]> {
    for (const key of this.keys()) {
      const ref = this.get(key)!;
      yield [key, await ref.read()];
    }
  }
}

/**
 * Map of references with synchronous iterators on values
 */
export class SyncRefMap<K, D, R extends SyncMutableRef<D>> extends RefMap<K, D, R> {
  // Methods
  *values(): Generator<D> {
    for (const ref of this.references()) {
      yield ref.read();
    }
  }

  *entries(): Generator<[K, D]> {
    for (const key of this.keys()) {
      const ref = this.get(key)!;
      yield [key, ref.read()];
    }
  }
}

export function map$<K, D, R extends SyncMutableRef<D>>(fn: MapFn<K, D, R>, opts: { sync: true }): SyncRefMap<K, D, R>;
export function map$<K, D, R extends MutableRef<D>>(fn: MapFn<K, D, R>, opts?: { sync?: false }): AsyncRefMap<K, D, R>;
export function map$<K, D, R extends MutableRef<D>>(fn: MapFn<K, D, R>, opts: { sync?: boolean } = {}): AsyncRefMap<K, D, R> | SyncRefMap<K, D, R & SyncMutableRef<D>> {
  if (opts.sync) {
    return new SyncRefMap(fn as MapFn<K, D, R & SyncMutableRef<D>>);
  } else {
    return new AsyncRefMap(fn);
  }
}
