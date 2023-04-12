import { KeyPart } from '@jujulego/event-tree';

import { SRef } from './s-ref';
import { Store } from './store';

// Class
export class MemoryStore<D, K extends KeyPart = KeyPart> extends Store<D, K> {
  // Attributes
  private readonly _memory = new Map<K, D>();

  // Methods
  protected createRef(key: K): SRef<D, K> {
    return new SRef<D, K>(key, {
      read: () => this._memory.get(key),
    });
  }

}
