import { IListenable, KeyPart, multiplexerMap, PrependEventMapKeys } from '@jujulego/event-tree';

import { WeakStore } from '@/src/utils';

import { SRef, SRefEventMap } from './s-ref';
import { DataRepository } from './types';

// Types
export type StoreEventMap<D, K extends KeyPart = KeyPart> = PrependEventMapKeys<K, SRefEventMap<D, K>>;

// Class
export class Store<D, K extends KeyPart = KeyPart> implements IListenable<StoreEventMap<D, K>> {
  // Attributes
  private readonly _refs = new WeakStore<SRef<D, K>>();
  private readonly _events = multiplexerMap((key: K) => this.read(key));

  // Constructor
  constructor(
    private readonly accessor: DataRepository<D, K>,
  ) {}

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;

  read(key: K): SRef<D, K> {
    return this._refs.getOrCreate(key, () => new SRef<D, K>(key, this.accessor));
  }

  update(key: K, data: D): SRef<D, K> {
    const sref = this.read(key);
    sref.update(data);

    return sref;
  }
}
