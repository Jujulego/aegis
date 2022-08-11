import { Store } from '@jujulego/aegis-core';

import { $entity } from './entity';
import { AegisId } from './utils';

// Mixins
export const $mixin = {
  entity<D, I extends AegisId>(name: string, store: Store, extractor: (itm: D) => I) {
    const entity = $entity(name, store, extractor);

    return class $Entity {
      // Attributes
      static readonly $entity = entity.$entity;
      static readonly $item = entity.$item;
      static readonly $list = entity.$list;
    };
  }
};
