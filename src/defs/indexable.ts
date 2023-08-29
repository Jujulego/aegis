import { KeyPart } from '@jujulego/event-tree';

import { Readable } from './readable.js';

export interface Indexable<D, K extends KeyPart = KeyPart, R extends Readable<D> = Readable<D>> {
  /**
   * Returns reference on "key" element.
   */
  ref(key: K): R;
}
