import { Entity, MemoryStore } from '@jujulego/aegis-core';

import { $Entity } from '../../src/decorators';
import { ENTITY_SYMBOL } from '../../src/decorators/symbols';

// Types
interface Test {
  id: string;
  success: boolean;
}

// Setup
let store: MemoryStore;

beforeEach(() => {
  store = new MemoryStore();
});

// Tests
describe('@$Entity', () => {
  it('should store a entity in class metadata', () => {
    @$Entity(store, (test: Test) => test.id)
    class TestEntity {}

    expect(Reflect.get(TestEntity, ENTITY_SYMBOL)).toBeInstanceOf(Entity);
    expect(Reflect.get(TestEntity, ENTITY_SYMBOL).name).toBe('TestEntity');
    expect(Reflect.get(TestEntity, ENTITY_SYMBOL).store).toBe(store);
  });
});
