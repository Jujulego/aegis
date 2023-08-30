import { KeyPart } from '@jujulego/event-tree';

import { OldStore } from './store.js';

// Repository
export class MemoryStore<D, K extends KeyPart = KeyPart> extends OldStore<D, K> {
  // Attributes
  protected readonly _map = new Map<K, D>();

  // Methods
  protected get(key: K): D | undefined {
    return this._map.get(key);
  }

  protected set(key: K, data: D): void {
    this._map.set(key, data);
  }
}
