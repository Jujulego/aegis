import { IListenable, KeyPart, multiplexerMap, PrependEventMapKeys } from '@jujulego/event-tree';

import { DRef, DRefEventMap } from '@/src/data';
import { WeakStore } from '@/src/utils';

// Types
export type StoreEventMap<D, K extends KeyPart = KeyPart> = PrependEventMapKeys<K, DRefEventMap<D>>;

// Class
export abstract class Store<D, K extends KeyPart = KeyPart> implements IListenable<StoreEventMap<D, K>> {
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
      update: (data) => this.set(key, data),
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
