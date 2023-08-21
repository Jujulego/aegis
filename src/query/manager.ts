import { IListenable, KeyPart, multiplexerMap, PrependEventMapKeys } from '@jujulego/event-tree';

import { WeakStore } from '../utils/index.js';

import { Fetcher, QRef, QRefEventMap, Strategy } from './q-ref.js';

// Types
export type ManagerEventMap<D, K extends KeyPart = KeyPart> = PrependEventMapKeys<K, QRefEventMap<D>>;

// Class
export class Manager<D, K extends KeyPart = KeyPart> implements IListenable<ManagerEventMap<D, K>> {
  // Attributes
  private readonly _refs = new WeakStore<K, QRef<D>>();
  private readonly _events = multiplexerMap((key: K) => this.ref(key));

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;

  ref(key: K): QRef<D> {
    return this._refs.getOrCreate(key, () => new QRef());
  }

  refresh(key: K, fetcher: Fetcher<D>, strategy: Strategy): QRef<D> {
    const ref = this.ref(key);
    ref.refresh(fetcher, strategy);

    return ref;
  }
}
