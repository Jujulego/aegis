import { Entity, Item, MemoryStore, Query } from '@jujulego/aegis-core';

import { $item } from '../src';

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

describe('$item', () => {
  describe('Unknown item (query)', () => {
    let query: Query<Test>;

    beforeEach(() => {
      query = new Query<Test>();
    });

    // Tests
    it('should get item when query completes', () => {
      const item = $item(entity, query);

      expect(item.$entity).toBe(entity);
      expect(item.isLoading).toBe(true);

      // Complete query
      query.complete({ id: 'test', success: true });

      expect(item.isLoading).toBe(false);
      expect(item.$id).toBe('test');
      expect(item.$item).toBeInstanceOf(Item);
      expect(item.$item?.id).toBe(JSON.stringify('test'));
      expect(item.data).toEqual({ id: 'test', success: true });
    });

    it('should throw when trying to update unknown item', () => {
      const item = $item(entity, query);

      // Update data
      jest.spyOn(store, 'set');

      expect(() => {
        item.data = { id: 'toto', success: false };
      }).toThrow(new Error('Cannot update unknown item'));

      expect(store.set).not.toHaveBeenCalled();
    });

    it('should update stored data', () => {
      const item = $item(entity, query);

      query.complete({ id: 'test', success: true });

      // Update data
      jest.spyOn(store, 'set');

      const data = { id: 'toto', success: false };
      item.data = data;

      expect(store.set).toHaveBeenCalledWith(entity.name, item.$item?.id, data);
      expect(item.data).toBe(data);
    });

    it('should emit store events (update)', () => {
      const item = $item(entity, query);

      query.complete({ id: 'test', success: true });

      // Register listener
      const spy = jest.fn();
      item.subscribe('update', spy);

      // Emit event
      store.set(entity.name, JSON.stringify('test'), { id: 'test', success: false });

      expect(spy).toHaveBeenCalledWith(
        {
          id: JSON.stringify('test'),
          old: { id: 'test', success: true },
          new: { id: 'test', success: false }
        },
        {
          type: `update.${entity.name}.${JSON.stringify('test')}`,
          source: store,
        }
      );

      expect(item.data).toEqual({ id: 'test', success: false });
    });

    it('should emit query manager events (query.pending)', () => {
      const item = $item(entity, query);

      query.complete({ id: 'test', success: true });

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.pending', spy);

      // Emit event
      item.$item?.refresh(() => new Query(), 'replace');

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'pending'
        },
        {
          type: 'query.pending',
          source: item.$item?.manager,
        }
      );

      expect(item.isLoading).toBe(true);
    });

    it('should emit query manager events (query.completed)', () => {
      const item = $item(entity, query);
      query.complete({ id: 'test', success: true });

      // Refresh query
      const q2 = new Query<Test>();
      item.$item?.refresh(() => q2, 'replace');

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.completed', spy);

      // Emit event
      q2.complete({ id: 'test', success: false });

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'completed',
          result: { id: 'test', success: false }
        },
        {
          type: 'query.completed',
          source: q2,
        }
      );

      expect(item.isLoading).toBe(false);
    });

    it('should emit query manager events (query.failed)', () => {
      const item = $item(entity, query);
      query.complete({ id: 'test', success: true });

      // Refresh query
      const q2 = new Query<Test>();
      item.$item?.refresh(() => q2, 'replace');

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.failed', spy);

      // Emit event
      q2.fail(new Error('Failed !'));

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'failed',
          error: new Error('Failed !')
        },
        {
          type: 'query.failed',
          source: q2,
        }
      );

      expect(item.isLoading).toBe(false);
    });

    it('should emit query events (query.completed)', () => {
      const item = $item(entity, query);

      expect(item.$entity).toBe(entity);
      expect(item.isLoading).toBe(true);

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.completed', spy);

      // Emit event
      query.complete({ id: 'test', success: true });

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'completed',
          result: { id: 'test', success: true }
        },
        {
          type: 'query.completed',
          source: query,
        }
      );

      expect(item.isLoading).toBe(false);
    });

    it('should emit query events (query.failed)', () => {
      const item = $item(entity, query);

      expect(item.$entity).toBe(entity);
      expect(item.isLoading).toBe(true);

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.failed', spy);

      // Emit event
      query.fail(new Error('Failed !'));

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'failed',
          error: new Error('Failed !')
        },
        {
          type: 'query.failed',
          source: query,
        }
      );

      expect(item.isLoading).toBe(false);
    });
  });

  describe('Known item (id)', () => {
    // Tests
    it('should return data from store', () => {
      const data = { id: 'test', success: true };
      store.set(entity.name, JSON.stringify('test'), data);

      const item = $item(entity, 'test');
      expect(item.data).toBe(data);
    });

    it('should update stored data', () => {
      const item = $item(entity, 'test');

      // Update data
      jest.spyOn(store, 'set');

      const data = { id: 'toto', success: false };
      item.data = data;

      expect(store.set).toHaveBeenCalledWith(entity.name, item.$item?.id, data);
      expect(item.data).toBe(data);
    });

    it('should emit store events (update)', () => {
      const item = $item(entity, 'test');

      // Register listener
      const spy = jest.fn();
      item.subscribe('update', spy);

      // Emit event
      store.set(entity.name, JSON.stringify('test'), { id: 'test', success: false });

      expect(spy).toHaveBeenCalledWith(
        {
          id: JSON.stringify('test'),
          new: { id: 'test', success: false }
        },
        {
          type: `update.${entity.name}.${JSON.stringify('test')}`,
          source: store,
        }
      );

      expect(item.data).toEqual({ id: 'test', success: false });
    });

    it('should emit query manager events (query.pending)', () => {
      const item = $item(entity, 'test');

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.pending', spy);

      // Emit event
      item.$item?.refresh(() => new Query(), 'replace');

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'pending'
        },
        {
          type: 'query.pending',
          source: item.$item?.manager,
        }
      );

      expect(item.isLoading).toBe(true);
    });

    it('should emit query manager events (query.completed)', () => {
      const item = $item(entity, 'test');

      // Refresh query
      const query = new Query<Test>();
      item.$item?.refresh(() => query, 'replace');

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.completed', spy);

      // Emit event
      query.complete({ id: 'test', success: false });

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'completed',
          result: { id: 'test', success: false }
        },
        {
          type: 'query.completed',
          source: query,
        }
      );

      expect(item.isLoading).toBe(false);
    });

    it('should emit query manager events (query.failed)', () => {
      const item = $item(entity, 'test');

      // Refresh query
      const query = new Query<Test>();
      item.$item?.refresh(() => query, 'replace');

      // Register listener
      const spy = jest.fn();
      item.subscribe('query.failed', spy);

      // Emit event
      query.fail(new Error('Failed !'));

      expect(spy).toHaveBeenCalledWith(
        {
          status: 'failed',
          error: new Error('Failed !')
        },
        {
          type: 'query.failed',
          source: query,
        }
      );

      expect(item.isLoading).toBe(false);
    });
  });
});
