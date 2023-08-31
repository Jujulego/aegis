import { IListenable, KeyPart, multiplexerMap } from '@jujulego/event-tree';

import { DRef, MutableRef } from '../refs/index.js';
import { WeakStore } from '../utils/weak-store.js';
import { Indexable } from '../defs/index.js';

// Types
export type StoreEventMap<D, K extends KeyPart = KeyPart> = Record<K, D>;

export type StoreFn<D, A = D, K extends KeyPart = KeyPart, R extends MutableRef<D, A> = MutableRef<D, A>> = (key: K) => R;

export interface Store<D, A = D, K extends KeyPart = KeyPart, R extends MutableRef<D, A> = MutableRef<D, A>> extends Indexable<D, K, R>, IListenable<StoreEventMap<D, K>> {
  mutate(key: K, arg: A): R;
}

// Builder
export function store$<D, A = D, K extends KeyPart = KeyPart, R extends MutableRef<D, A> = MutableRef<D, A>>(fn: StoreFn<D, A, K, R>): Store<D, A, K, R> {
  // Ref management
  const refs = new WeakStore<K, R>();

  function ref(key: K): R {
    return refs.getOrCreate(key, () => fn(key));
  }

  // Store
  const events = multiplexerMap(ref);

  return {
    on: events.on,
    off: events.off,
    clear: events.clear,

    ref,
    mutate(key: K, arg: A): R {
      const r = ref(key);
      r.mutate(arg);

      return r;
    }
  };
}

// Class
export abstract class OldStore<D, K extends KeyPart = KeyPart> implements IListenable<StoreEventMap<D, K>> {
  // Attributes
  private readonly _refs = new WeakStore<K, DRef<D>>();
  private readonly _events = multiplexerMap((key: K) => this.ref(key));

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;

  protected abstract get(key: K): D | undefined;
  protected abstract set(key: K, data: D): void;

  private _createRef(key: K): DRef<D> {
    return new DRef<D>({
      read: () => this.get(key),
      update: (data: D) => this.set(key, data),
    });
  }

  ref(key: K): DRef<D> {
    return this._refs.getOrCreate(key, () => this._createRef(key));
  }

  update(key: K, data: D, opts?: { lazy?: false }): DRef<D>;
  update(key: K, data: D, opts: { lazy: true }): DRef<D> | undefined;
  update(key: K, data: D, opts: { lazy?: boolean } = {}): DRef<D> | undefined {
    let ref = this._refs.get(key);

    if (!ref && !opts.lazy) {
      ref = this._createRef(key);
      this._refs.set(key, ref);
    }

    if (ref) {
      ref.update(data);
    }

    return ref;
  }
}
