import { KeyPart, multiplexerMap } from '@jujulego/event-tree';

import { WeakStore } from '@/src/utils';

import { Fetcher, QRef, Strategy } from './q-ref';

// Class
export class Manager<D, K extends KeyPart = KeyPart> {
  // Attributes
  private readonly _refs = new WeakStore<K, QRef<D>>();
  private readonly _events = multiplexerMap((key: K) => this.read(key));

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;

  read(key: K): QRef<D> {
    return this._refs.getOrCreate(key, () => new QRef());
  }

  refresh(key: K, fetcher: Fetcher<D>, strategy: Strategy): QRef<D> {
    const ref = this.read(key);
    ref.refresh(fetcher, strategy);

    return ref;
  }
}
