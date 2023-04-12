import { KeyPart } from '@jujulego/event-tree';

import { Store } from './store';
import { DataRepository } from './types';

// Class
export class MemoryRepository<D, K extends KeyPart = KeyPart> implements DataRepository<D, K> {
  // Attributes
  private readonly _memory = new Map<K, D>();

  // Methods
  read(key: K): D | undefined {
    return this._memory.get(key);
  }
}

// Utils
export function $memory() {
  return new Store(new MemoryRepository());
}