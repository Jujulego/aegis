import { Entity, Store } from '@jujulego/aegis-core';

import { AegisId } from '../utils';
import { ENTITY_SYMBOL } from './symbols';

// Decorators
export function $Entity(store: Store, extractor: (itm: any) => AegisId) {
  return (constructor: { new (...args: any[]): unknown }) => {
    Reflect.set(constructor, ENTITY_SYMBOL, new Entity(constructor.name, store, (itm) => JSON.stringify(extractor(itm))));
  };
}
