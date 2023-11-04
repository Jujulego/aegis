import { Listenable, KeyPart, ListenEventRecord, _multiplexer$ } from '@jujulego/event-tree';

import { Ref } from '../defs/index.js';

// Types
export type RegistryFn<K extends KeyPart, R extends Ref> = (key: K) => R;
export type RegistryEventMap<K extends KeyPart, R extends Ref> = ListenEventRecord<K, R>;

/**
 * Manages a set of references by key.
 * Will always return the same reference for a given key, and create it, if it does not exist, using given callback.
 *
 * @param fn Reference builder, receives the asked key by argument
 */
export class RefRegistry<K extends KeyPart, R extends Ref> implements Listenable<RegistryEventMap<K, R>> {
  // Attributes
  private readonly _builder: RegistryFn<K, R>;
  private readonly _references = new Map<K, R>();
  private readonly _events = _multiplexer$<Record<K, R>>(this._references, (key) => this._getRef(key));

  // Constructor
  constructor(builder: RegistryFn<K, R>) {
    this._builder = builder;
  }

  // Methods
  private _getRef(key: K): R {
    let ref = this._references.get(key);

    if (!ref) {
      ref = this._builder(key);
      this._references.set(key, ref);
    }

    return ref;
  }

  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly keys = this._events.keys;
  readonly clear = this._events.clear;

  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   */
  ref(key: K): R;

  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   * @param lazy if true will not create a reference if none exists
   */
  ref(key: K, lazy: false): R;

  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   * @param lazy if true will not create a reference if none exists
   */
  ref(key: K, lazy: boolean): R | undefined;

  ref(key: K, lazy = false) {
    return lazy ? this._references.get(key) : this._getRef(key);
  }
}

/**
 * Manages a set of references by key.
 * Will always return the same reference for a given key, and create it, if it does not exist, using given callback.
 *
 * @param fn Reference builder, receives the asked key by argument
 */
export function registry$<K extends KeyPart, R extends Ref>(fn: RegistryFn<K, R>): RefRegistry<K, R> {
  return new RefRegistry(fn);
}