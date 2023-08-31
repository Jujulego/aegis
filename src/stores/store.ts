import { IListenable, KeyPart, multiplexerMap } from '@jujulego/event-tree';

import { MutableRef } from '../refs/index.js';
import { WeakStore } from '../utils/weak-store.js';

// Types
export type StoreEventMap<D, K extends KeyPart = KeyPart> = Record<K, D>;

export type StoreFn<D, A = D, K extends KeyPart = KeyPart, R extends MutableRef<D, A> = MutableRef<D, A>> = (key: K) => R;

export interface Store<D, A = D, K extends KeyPart = KeyPart, R extends MutableRef<D, A> = MutableRef<D, A>> extends IListenable<StoreEventMap<D, K>> {
  ref(key: K): R;

  mutate(key: K, arg: A, opts?: { lazy?: false }): R;
  mutate(key: K, arg: A, opts: { lazy: true }): R | undefined;
}

// Builder
export function store$<D, A = D, K extends KeyPart = KeyPart, R extends MutableRef<D, A> = MutableRef<D, A>>(fn: StoreFn<D, A, K, R>): Store<D, A, K, R> {
  // Ref management
  const refs = new WeakStore<K, R>();

  function getRef(key: K): R {
    return refs.getOrCreate(key, () => fn(key));
  }

  // Store
  const events = multiplexerMap(getRef);

  return {
    on: events.on,
    off: events.off,
    clear: events.clear,

    ref: getRef,
    mutate(key: K, arg: A, opts: { lazy?: boolean } = {}): R | undefined {
      let ref = refs.get(key);

      if (!ref && !opts.lazy) {
        ref = fn(key);
        refs.set(key, ref);
      }

      if (ref) {
        ref.mutate(arg);
      }

      return ref;
    }
  } as Store<D, A, K, R>;
}
