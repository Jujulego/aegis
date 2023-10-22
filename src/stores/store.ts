import { KeyPart } from '@jujulego/event-tree';

import { MutableRef } from '../defs/index.js';
import { Registry, registry$, RegistryFn } from '../registry.js';

// Types
export type StoreFn<K extends KeyPart, R extends MutableRef> = RegistryFn<K, R>;

export interface Store<K extends KeyPart, D, A = D, R extends MutableRef<D, A> = MutableRef<D, A>> extends Registry<K, R> {
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
export function store$<K extends KeyPart, D, A = D, R extends MutableRef<D, A> = MutableRef<D, A>>(fn: StoreFn<K, R>): Store<K, D, A, R> {
  const registry = registry$(fn);

  return Object.assign(registry, {
    mutate(key: K, arg: A): R {
      const ref = registry.ref(key);
      ref.mutate(arg);

      return ref;
    },
    trigger(key: K, data: D): void {
      const ref = registry.ref(key, true);

      if (ref) {
        ref.next(data);
      }
    }
  });
}
