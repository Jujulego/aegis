import { Entity, MemoryStore } from '@jujulego/aegis-core';

import { $mixin } from '../src';

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
describe('$mixin.entity', () => {
  it('should add a static $entity property holding a configured entity', () => {
    class TestEntity extends $mixin.entity('Test', store, (test: Test) => test.id) {}

    expect(TestEntity.$entity).toBeInstanceOf(Entity);
    expect(TestEntity.$entity.name).toBe('Test');
    expect(TestEntity.$entity.store).toBe(store);
  });
});
