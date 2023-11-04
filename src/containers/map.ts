import { MutableRef } from '../defs/index.js';

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
}