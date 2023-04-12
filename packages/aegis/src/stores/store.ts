import { IListenable, KeyPart, multiplexerMap, PrependEventMapKeys } from '@jujulego/event-tree';

import { WeakStore } from '@/src/utils';

import { SRef, SRefEventMap } from './s-ref';

// Types
export type StoreCreateRef<D, K extends KeyPart = KeyPart> = (key: K) => SRef<D, K>;

export type StoreEventMap<D, K extends KeyPart = KeyPart> = PrependEventMapKeys<K, SRefEventMap<D, K>>;

// Class
export abstract class Store<D, K extends KeyPart = KeyPart> implements IListenable<StoreEventMap<D, K>> {
  // Attributes
  private readonly _refs = new WeakStore<SRef<D, K>>();
  private readonly _events = multiplexerMap((key: K) => this.get(key));

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;

  protected abstract createRef(key: K): SRef<D, K>;

  get(key: K): SRef<D, K> {
    return this._refs.getOrCreate(key, () => this.createRef(key));
  }
}
