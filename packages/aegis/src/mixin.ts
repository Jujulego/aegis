import { Store } from '@jujulego/aegis-core';

import { $entity } from './entity';
import { AegisId } from './utils';

// Mixins
export const $mixin = {
  /**
   * Constructs an entity base class with given parameters.
   * The base class has every `$entity` utilities as static attributes.
   *
   * @param name
   * @param store
   * @param extractor
   *
   * @example
   * // Item type
   * interface Test {
   *   id: string;
   *   success: boolean;
   * }
   *
   * // Entity class
   * class TestEntity extends $mixin.entity('Test', $store.memory(), (test: Test) => test.id) {
   *   readonly getById = TestEntity.$item.query((id: string) => ...); // <= item query
   *   readonly findAll = TestEntity.$list.query(() => ...); // <= list query
   * }
   *
   * // Usage
   * const testentity = new TestEntity();
   * const item = testentity.getById('example'); // <= returns a item wrapper
   *
   * @see $entity
   */
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
