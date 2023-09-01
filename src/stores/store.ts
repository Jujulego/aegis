import { IListenable, KeyPart, multiplexerMap } from '@jujulego/event-tree';

import { MutableRef } from '../refs/index.js';
import { WeakStore } from '../utils/weak-store.js';

// Types
export type StoreEventMap<K extends KeyPart, D> = Record<K, D>;

export type StoreFn<K extends KeyPart, D, A = D, R extends MutableRef<D, A> = MutableRef<D, A>> = (key: K) => R;

export interface Store<K extends KeyPart, D, A = D, R extends MutableRef<D, A> = MutableRef<D, A>> extends IListenable<StoreEventMap<K, D>> {
  /**
   * Returns a reference on the "key" element.
   *
   * @param key
   */
  ref(key: K): R;

  /**
   * Mutates the "key" element, using the given arg.
   * Return a reference on the mutated element.
   *
   * @param key
   * @param arg
   */
  mutate(key: K, arg: A): R;

  /**
   * Triggers listeners and references pointing "key" element, indicating the stored value has changed.
   * The trigger is automatic in case of mutation using the "mutate" method.
   *
   * @param key
   * @param data
   */
  trigger(key: K, data: D): void;
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
    mutate(key: K, arg: A): R {
      const ref = getRef(key);
      ref.mutate(arg);

      return ref;
    },
    trigger(key: K, data: D): void {
      const ref = refs.get(key);

      if (ref) {
        ref.next(data);
      }
    }
  };
}
