import { Entity, Store } from '@jujulego/aegis-core';

import { AegisId } from './utils';
import { $item, $list, AegisItem, AegisList } from './wrappers';

// Mixins
export const $mixin = {
  entity<D, I extends AegisId>(name: string, store: Store, extractor: (itm: D) => I) {
    const entity = new Entity<D>(name, store, (itm) => JSON.stringify(extractor(itm)));

    return class $Entity {
      // Attributes
      static readonly $entity = entity;

      // Methods
      $item(id: I): AegisItem<D, I> {
        return $item(entity, id);
      }

      $list(key: string): AegisList<D> {
        return $list(entity, key);
      }
    };
  }
};
