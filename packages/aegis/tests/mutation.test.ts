import { Entity, MemoryStore, Query } from '@jujulego/aegis-core';

import { $mutation } from '../src';

// Types
interface Test {
  id: string;
  success: boolean;
}

// Setup
let store: MemoryStore;
let entity: Entity<Test>;

beforeEach(() => {
  store = new MemoryStore();
  entity = new Entity('Test', store, (itm) => JSON.stringify(itm.id));
});

describe('$mutation', () => {
  describe('Unknown item mutated', () => {
    let query: Query<Test>;

    beforeEach(() => {
      query = new Query<Test>();
    });

    // Tests
    it('should be linked to an unknown item', () => {
      const mutation = $mutation(entity, query);

      expect(mutation.$id).toBeUndefined();
      expect(mutation.isLoading).toBe(true);
      expect(mutation.result).toBeUndefined();

      expect(mutation.item.$id).toBeUndefined();
    });

    it('should link to known item when query completes', () => {
      const mutation = $mutation(entity, query);

      // Complete query
      const data = { id: 'test', success: true };
      query.complete(data);

      expect(mutation.$id).toBe('test');
      expect(mutation.isLoading).toBe(false);
      expect(mutation.result).toBe(data);

      expect(mutation.item.$id).toBe('test');
    });
  });
});
