import { Entity, MemoryStore, Query } from '@jujulego/aegis-core';

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

  it('should add a static $item method returning a known item wrapper', () => {
    class TestEntity extends $mixin.entity('Test', store, (test: Test) => test.id) {}

    const item = TestEntity.$item('test');

    expect(item.$id).toBe('test');
    expect(item.$entity).toBe(TestEntity.$entity);
  });

  it('should add a static $list method returning a list wrapper', () => {
    class TestEntity extends $mixin.entity('Test', store, (test: Test) => test.id) {}

    const list = TestEntity.$list('test');

    expect(list.$key).toBe('test');
    expect(list.$entity).toBe(TestEntity.$entity);
  });
});
