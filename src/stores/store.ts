import { IListenable, KeyPart, multiplexerMap } from '@jujulego/event-tree';

import { MutableRef } from '../refs/index.js';
import { WeakStore } from '../utils/weak-store.js';

// Types
export type StoreEventMap<K extends KeyPart, D> = Record<K, D>;

export type StoreFn<K extends KeyPart, D, A = D, R extends MutableRef<D, A> = MutableRef<D, A>> = (key: K) => R;

export interface Store<K extends KeyPart, D, A = D, R extends MutableRef<D, A> = MutableRef<D, A>> extends IListenable<StoreEventMap<K, D>> {
  ref(key: K): R;

  mutate(key: K, arg: A, opts?: { lazy?: false }): R;
  mutate(key: K, arg: A, opts: { lazy: true }): R | undefined;
}

// Builder
export function store$<K extends KeyPart, D, A = D, R extends MutableRef<D, A> = MutableRef<D, A>>(fn: StoreFn<K, D, A, R>): Store<K, D, A, R> {
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
  } as Store<K, D, A, R>;
}
