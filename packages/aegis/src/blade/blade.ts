import { KeyPart, once } from '@jujulego/event-tree';
import { Query } from '@jujulego/utils';

import { Fetcher, Manager, Strategy } from '@/src/query';
import { MemoryStore, Store } from '@/src/store';
import { BRef } from '@/src/blade/b-ref';

// Types
export type Extractor<D, K extends KeyPart = KeyPart> = (entity: D) => K;

export interface BladeOptions<D, K extends KeyPart = KeyPart> {
  manager?: Manager<D, K>;
  store?: Store<D, K>;
}

// Class
export class Blade<D, K extends KeyPart = KeyPart> {
  // Attributes
  private readonly _extractor: Extractor<D, K>;
  private readonly _manager: Manager<D, K>;
  private readonly _store: Store<D, K>;

  // Constructor
  constructor(
    extractor: Extractor<D, K>,
    options: BladeOptions<D, K> = {}
  ) {
    this._extractor = extractor;
    this._manager = options.manager ?? new Manager<D, K>();
    this._store = options.store ?? new MemoryStore<D, K>();
  }

  // Methods
  register(query: Query<D>) { // TODO: return a reference on unknown data
    once(query, 'done', ({ data }) => {
      this._store.update(this._extractor(data), data, { lazy: true });
    });
  }

  refresh(key: K, fetcher: Fetcher<D>, strategy: Strategy): BRef<D> {
    return new BRef(
      this._manager.refresh(key, fetcher, strategy),
      this._store.ref(key)
    );
  }
}