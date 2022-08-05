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
  let query: Query<Test>;

  beforeEach(() => {
    query = new Query<Test>();
  });

  // Tests
  it('should be linked to the item with given id', () => {
    const mutation = $mutation(entity, query, 'test');

    expect(mutation.$id).toBe('test');
    expect(mutation.isLoading).toBe(true);
    expect(mutation.result).toBeUndefined();

    expect(mutation.item.$id).toBe('test');
  });

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

  it('should emit query events (status.completed)', () => {
    const mutation = $mutation(entity, query);

    expect(mutation.isLoading).toBe(true);

    // Register listener
    const spy = jest.fn();
    mutation.subscribe('status.completed', spy);

    // Emit event
    query.complete({ id: 'test', success: true });

    expect(spy).toHaveBeenCalledWith(
      {
        status: 'completed',
        result: { id: 'test', success: true }
      },
      {
        type: 'status.completed',
        source: query,
      }
    );

    expect(mutation.isLoading).toBe(false);
  });

  it('should emit query events (status.failed)', () => {
    const mutation = $mutation(entity, query);

    expect(mutation.isLoading).toBe(true);

    // Register listener
    const spy = jest.fn();
    mutation.subscribe('status.failed', spy);

    // Emit event
    query.fail(new Error('Failed !'));

    expect(spy).toHaveBeenCalledWith(
      {
        status: 'failed',
        error: new Error('Failed !')
      },
      {
        type: 'status.failed',
        source: query,
      }
    );

    expect(mutation.isLoading).toBe(false);
  });

  it('should resolve when query completes', async () => {
    const mutation = $mutation(entity, query);

    // Emit event
    setTimeout(() => query.complete({ id: 'test', success: true }), 0);

    await expect(mutation)
      .resolves.toEqual({ id: 'test', success: true });
  });

  it('should reject when query fails', async () => {
    const mutation = $mutation(entity, query);

    // Emit event
    setTimeout(() => query.fail(new Error('Failed !')), 0);

    await expect(mutation)
      .rejects.toEqual(new Error('Failed !'));
  });
});
