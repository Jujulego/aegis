import { Entity, MemoryStore, Query } from '@jujulego/aegis-core';

import { $entity } from '../src';

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
describe('$entity', () => {
  it('should create a new entity', () => {
    const entity = $entity('Test', store, (test: Test) => test.id);

    expect(entity.$entity).toBeInstanceOf(Entity);
    expect(entity.$entity.name).toBe('Test');
    expect(entity.$entity.store).toBe(store);
  });

  describe('$entity().$item', () => {
    it('should return a known item wrapper', () => {
      const entity = $entity('Test', store, (test: Test) => test.id);

      const item = entity.$item('test');

      expect(item.$id).toBe('test');
      expect(item.$entity).toBe(entity.$entity);
    });

    describe('$entity().$item.query', () => {
      it('should wrap fetcher so it returns an unknown item wrapper', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        const query = new Query<Test>();
        const querier = jest.fn((a: number, b: string) => query);

        // Wrap & Call
        const fetcher = entity.$item.query(querier);
        const $item = fetcher(1, 'successful');

        expect(querier).toHaveBeenCalledWith(1, 'successful');

        expect($item.$id).toBeUndefined();
        expect($item.$entity).toBe(entity.$entity);
        expect($item.isLoading).toBe(true);
      });

      it('should wrap fetcher so it returns a known item wrapper (id based on fetcher args)', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        const query = new Query<Test>();
        const querier = jest.fn((id: string) => query);

        // Wrap & Call
        const fetcher = entity.$item.query(querier, (id) => id);
        const $item = fetcher('test');

        expect(querier).toHaveBeenCalledWith('test');

        expect($item.$id).toBe('test');
        expect($item.$entity).toBe(entity.$entity);
        expect($item.$item.manager.query).toBe(query);
        expect($item.isLoading).toBe(true);
        expect($item).toHaveProperty('refresh');
      });

      it('should wrap fetcher so it apply refresh strategy (only for known item)', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Setup first query
        const q1 = new Query<Test>();
        entity.$item('test').$item.refresh(() => q1, 'replace');

        // Wrap fetcher
        const q2 = new Query<Test>();
        const querier = jest.fn((id: string) => q2);
        const fetcher = entity.$item.query(querier, (id) => id, { strategy: 'keep' });

        // Call
        const $item = fetcher('test');

        expect(querier).not.toHaveBeenCalled();

        expect($item.isLoading).toBe(true);
        expect($item.$item.manager.query).toBe(q1);
      });

      it('should wrap fetcher so it is not called if item is already cached or loaded [refresh: if-unknown] (only for known item)', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Wrap fetcher
        const q1 = new Query<Test>();
        const querier = jest.fn((id: string) => q1);
        const fetcher = entity.$item.query(querier, (id) => id, { refresh: 'if-unknown' });

        // Call while unknown
        let $item = fetcher('test');

        expect(querier).toHaveBeenCalled();

        expect($item.isLoading).toBe(true);
        expect($item.$item.manager.query).toBe(q1);

        // Complete first query
        q1.complete({ id: 'test', success: true });

        expect($item.isLoading).toBe(false);
        expect($item.$item.state).toBe('loaded');

        // Reset mock
        const q2 = new Query<Test>();

        querier.mockReset();
        querier.mockReturnValue(q2);

        // Call while loaded
        $item = fetcher('test');

        expect(querier).not.toHaveBeenCalled();

        expect($item.isLoading).toBe(false);
        expect($item.$item.manager.query).toBe(q1);
      });

      it('should wrap fetcher so it is always called [refresh: always] (only for known item)', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Wrap fetcher
        const q1 = new Query<Test>();
        const querier = jest.fn((id: string) => q1);
        const fetcher = entity.$item.query(querier, (id) => id, { refresh: 'always' });

        // Call while unknown
        let $item = fetcher('test');

        expect(querier).toHaveBeenCalled();

        expect($item.isLoading).toBe(true);
        expect($item.$item.manager.query).toBe(q1);

        // Complete first query
        q1.complete({ id: 'test', success: true });

        expect($item.isLoading).toBe(false);
        expect($item.$item.state).toBe('loaded');

        // Reset mock
        const q2 = new Query<Test>();

        querier.mockReset();
        querier.mockReturnValue(q2);

        // Call while loaded
        $item = fetcher('test');

        expect(querier).toHaveBeenCalled();

        expect($item.isLoading).toBe(true);
        expect($item.$item.manager.query).toBe(q2);
      });

      it('should wrap fetcher so it is never called [refresh: never] (only for known item)', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Wrap fetcher
        const query = new Query<Test>();
        const querier = jest.fn((id: string) => query);
        const fetcher = entity.$item.query(querier, (id) => id, { refresh: 'never' });

        // Call while unknown
        let $item = fetcher('test');

        expect(querier).not.toHaveBeenCalled();

        expect($item.isLoading).toBe(false);
        expect($item.$item.manager.query).toBeUndefined();

        // Fill store
        $item.data = { id: 'test', success: true };

        expect($item.$item.state).toBe('cached');

        // Reset mock
        querier.mockReset();

        // Call while cached
        $item = fetcher('test');

        expect(querier).not.toHaveBeenCalled();

        expect($item.isLoading).toBe(false);
        expect($item.$item.manager.query).toBeUndefined();
      });
    });

    describe('$entity().$item.mutation', () => {
      it('should wrap fetcher so it returns an unknown mutation wrapper', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        const query = new Query<Test>();
        const querier = jest.fn((b: string) => query);

        // Wrap & Call
        const fetcher = entity.$item.mutate(querier);
        const mutation = fetcher('successful');

        expect(querier).toHaveBeenCalledWith('successful');

        expect(mutation.$id).toBeUndefined();
        expect(mutation.$entity).toBe(entity.$entity);
        expect(mutation.isLoading).toBe(true);
      });

      it('should wrap fetcher so it returns a known mutation wrapper', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        const query = new Query<Test>();
        const querier = jest.fn((id: string, b: string) => query);

        // Wrap & Call
        const fetcher = entity.$item.mutate(querier, (id) => id);
        const mutation = fetcher('test', 'successful');

        expect(querier).toHaveBeenCalledWith('test', 'successful');

        expect(mutation.$id).toBe('test');
        expect(mutation.$entity).toBe(entity.$entity);
        expect(mutation.isLoading).toBe(true);
      });

      it('should wrap fetcher so it returns a known mutation wrapper with a merge function', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);
        entity.$item('test').data = { id: 'test', success: true };

        jest.spyOn(entity.$entity, 'mutation');

        const query = new Query<boolean>();
        const querier = jest.fn((id: string, b: boolean) => query);
        const merger = jest.fn((old: Test, res: boolean) => ({ ...old, success: res }));

        // Wrap & Call
        const fetcher = entity.$item.mutate(querier, (id) => id, merger);
        const mutation = fetcher('test', false);

        expect(querier).toHaveBeenCalledWith('test', false);

        expect(entity.$entity.mutation).toHaveBeenCalledWith(JSON.stringify('test'), query, merger);

        expect(mutation.$id).toBe('test');
        expect(mutation.$entity).toBe(entity.$entity);
        expect(mutation.isLoading).toBe(true);
      });
    });

    describe('$entity().$item.delete', () => {
      it('should wrap fetcher so it returns a known mutation wrapper', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);
        entity.$item('test').data = { id: 'test', success: true };

        jest.spyOn(entity.$entity, 'deletion');

        const query = new Query<void>();
        const querier = jest.fn((id: string) => query);

        // Wrap & Call
        const fetcher = entity.$item.delete(querier, (id) => id);
        const mutation = fetcher('test');

        expect(querier).toHaveBeenCalledWith('test');

        expect(entity.$entity.deletion).toHaveBeenCalledWith(JSON.stringify('test'), query);

        expect(mutation.$id).toBe('test');
        expect(mutation.$entity).toBe(entity.$entity);
        expect(mutation.isLoading).toBe(true);
      });
    });
  });

  describe('$entity().$list', () => {
    it('should return a list wrapper', () => {
      const entity = $entity('Test', store, (test: Test) => test.id);

      const list = entity.$list('test');

      expect(list.$key).toBe('test');
      expect(list.$entity).toBe(entity.$entity);
    });

    describe('$entity().$list.query', () => {
      it('should wrap fetcher so it returns a list wrapper', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        const query = new Query<Test[]>();
        const querier = jest.fn((a: number, b: string) => query);

        // Wrap & Call
        const fetcher = entity.$list.query(querier);
        const $list = fetcher('test', 1, 'successful');

        expect(querier).toHaveBeenCalledWith(1, 'successful');

        expect($list.$key).toBe('test');
        expect($list.$entity).toBe(entity.$entity);
        expect($list.isLoading).toBe(true);
        expect($list.$list.manager.query).toBe(query);
        expect($list).toHaveProperty('refresh');
      });

      it('should wrap fetcher so it apply refresh strategy', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Setup first query
        const q1 = new Query<Test[]>();
        entity.$list('test').$list.refresh(() => q1, 'replace');

        // Wrap fetcher
        const q2 = new Query<Test[]>();
        const querier = jest.fn((_a: number, _b: string) => q2);
        const fetcher = entity.$list.query(querier, { strategy: 'keep' });

        // Call
        const $list = fetcher('test', 1, 'successful');

        expect(querier).not.toHaveBeenCalled();

        expect($list.isLoading).toBe(true);
        expect($list.$list.manager.query).toBe(q1);
      });

      it('should wrap fetcher so it is not called if item is already cached or loaded [refresh: if-unknown]', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Wrap fetcher
        const q1 = new Query<Test[]>();
        const querier = jest.fn(() => q1);
        const fetcher = entity.$list.query(querier, { refresh: 'if-unknown' });

        // Call while unknown
        let $list = fetcher('test');

        expect(querier).toHaveBeenCalled();

        expect($list.isLoading).toBe(true);
        expect($list.$list.manager.query).toBe(q1);

        // Complete first query
        q1.complete([{ id: 'test', success: true }]);

        expect($list.isLoading).toBe(false);
        expect($list.$list.state).toBe('loaded');

        // Reset mock
        const q2 = new Query<Test[]>();

        querier.mockReset();
        querier.mockReturnValue(q2);

        // Call while loaded
        $list = fetcher('test');

        expect(querier).not.toHaveBeenCalled();

        expect($list.isLoading).toBe(false);
        expect($list.$list.manager.query).toBe(q1);
      });

      it('should wrap fetcher so it is always called [refresh: always]', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Wrap fetcher
        const q1 = new Query<Test[]>();
        const querier = jest.fn(() => q1);
        const fetcher = entity.$list.query(querier, { refresh: 'always' });

        // Call while unknown
        let $list = fetcher('test');

        expect(querier).toHaveBeenCalled();

        expect($list.isLoading).toBe(true);
        expect($list.$list.manager.query).toBe(q1);

        // Complete first query
        q1.complete([{ id: 'test', success: true }]);

        expect($list.isLoading).toBe(false);
        expect($list.$list.state).toBe('loaded');

        // Reset mock
        const q2 = new Query<Test[]>();

        querier.mockReset();
        querier.mockReturnValue(q2);

        // Call while loaded
        $list = fetcher('test');

        expect(querier).toHaveBeenCalled();

        expect($list.isLoading).toBe(true);
        expect($list.$list.manager.query).toBe(q2);
      });

      it('should wrap fetcher so it is never called [refresh: never]', () => {
        const entity = $entity('Test', store, (test: Test) => test.id);

        // Wrap fetcher
        const query = new Query<Test[]>();
        const querier = jest.fn(() => query);
        const fetcher = entity.$list.query(querier, { refresh: 'never' });

        // Call while unknown
        let $list = fetcher('test');

        expect(querier).not.toHaveBeenCalled();

        expect($list.isLoading).toBe(false);
        expect($list.$list.manager.query).toBeUndefined();

        // Fill store
        $list.data = [{ id: 'test', success: true }];

        expect($list.$list.state).toBe('cached');

        // Reset mock
        querier.mockReset();

        // Call while cached
        $list = fetcher('test');

        expect(querier).not.toHaveBeenCalled();

        expect($list.isLoading).toBe(false);
        expect($list.$list.manager.query).toBeUndefined();
      });
    });
  });

  describe('$entity().$protocol', () => {
    it('should assign protocol functions to the entity', () => {
      const entity = $entity('Test', store, (test: Test) => test.id)
        .$protocol(({ $item, $list }) => ({
          create: $item.query(() => new Query()),
          getById: $item.query((id: string) => new Query(), (id) => id, { strategy: 'keep' }),
          findAll: $list.query(() => new Query(), { strategy: 'replace' }),
          updateById: $item.mutate((id: string, body: unknown) => new Query(), (id) => id),
          deleteById: $item.delete((id: string) => new Query(), (id) => id),
        }));

      expect(entity).toHaveProperty('create');
      expect(entity).toHaveProperty('getById');
      expect(entity).toHaveProperty('findAll');
      expect(entity).toHaveProperty('updateById');
      expect(entity).toHaveProperty('deleteById');
    });
  });
});
