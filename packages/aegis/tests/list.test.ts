import { Entity, MemoryStore, Query } from '@jujulego/aegis-core';

import { $list } from '../src';

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

describe('$list', () => {
  it('should return data from store', () => {
    entity.list('test').data = [
      { id: 'test-1', success: true },
      { id: 'test-2', success: true },
      { id: 'test-3', success: false },
    ];

    const list = $list(entity, 'test');
    expect(list.data).toEqual([
      { id: 'test-1', success: true },
      { id: 'test-2', success: true },
      { id: 'test-3', success: false },
    ]);
  });

  it('should resolve to data from store', async () => {
    entity.list('test').data = [
      { id: 'test-1', success: true },
      { id: 'test-2', success: true },
      { id: 'test-3', success: false },
    ];

    const list = $list(entity, 'test');
    await expect(list).resolves.toEqual([
      { id: 'test-1', success: true },
      { id: 'test-2', success: true },
      { id: 'test-3', success: false },
    ]);
  });

  it('should update stored data', () => {
    const list = $list(entity, 'test');

    // Update data
    jest.spyOn(store, 'set');

    const data = [
      { id: 'test-1', success: true },
      { id: 'test-2', success: true },
      { id: 'test-3', success: false },
    ];
    list.data = data;

    expect(store.set).toHaveBeenCalledWith(entity.name, JSON.stringify(data[0].id), data[0]);
    expect(store.set).toHaveBeenCalledWith(entity.name, JSON.stringify(data[1].id), data[1]);
    expect(store.set).toHaveBeenCalledWith(entity.name, JSON.stringify(data[2].id), data[2]);
    expect(list.data).toBe(data);
  });

  it('should register refresh method', () => {
    const fetcher = jest.fn(() => new Query<Test[]>());
    const list = $list(entity, 'test', fetcher);

    expect(list).toHaveProperty('refresh');

    // Call refresh
    jest.spyOn(list.$list, 'refresh');
    list.refresh('keep');

    expect(list.$list.refresh).toHaveBeenCalledWith(fetcher, 'keep');
  });

  it('should emit store events (update)', async () => {
    const list = $list(entity, 'test');
    entity.list('test').data = [
      { id: 'test-1', success: true },
      { id: 'test-2', success: true },
      { id: 'test-3', success: false },
    ];

    // Register listener
    const spy = jest.fn();
    list.subscribe('update', spy);

    // Emit event
    store.set(entity.name, JSON.stringify('test-2'), { id: 'test-2', success: false });

    await new Promise((res) => setTimeout(res, 0));
    expect(spy).toHaveBeenCalledWith(
      [
        { id: 'test-1', success: true },
        { id: 'test-2', success: false },
        { id: 'test-3', success: false },
      ],
      {
        type: 'update',
        source: list.$list
      }
    );
  });

  it('should emit query manager events (status.pending)', () => {
    const list = $list(entity, 'test');

    // Register listener
    const spy = jest.fn();
    list.subscribe('status.pending', spy);

    // Emit event
    list.$list.refresh(() => new Query(), 'replace');

    expect(spy).toHaveBeenCalledWith(
      {
        status: 'pending',
      },
      {
        type: 'status.pending',
        source: list.$list.manager,
      }
    );

    expect(list.isLoading).toBe(true);
  });

  it('should emit query manager events (status.completed)', () => {
    const list = $list(entity, 'test');

    // Refresh query
    const query = new Query<Test[]>();
    list.$list.refresh(() => query, 'replace');

    // Register listener
    const spy = jest.fn();
    list.subscribe('status.completed', spy);

    // Emit event
    query.complete([{ id: 'test', success: false }]);

    expect(spy).toHaveBeenCalledWith(
      {
        status: 'completed',
        result: [{ id: 'test', success: false }]
      },
      {
        type: 'status.completed',
        source: query,
      }
    );

    expect(list.isLoading).toBe(false);
  });

  it('should emit query manager events (status.failed)', () => {
    const list = $list(entity, 'test');

    // Refresh query
    const query = new Query<Test[]>();
    list.$list.refresh(() => query, 'replace');

    // Register listener
    const spy = jest.fn();
    list.subscribe('status.failed', spy);

    // Emit event
    query.fail(new Error('Failed !'));

    expect(spy).toHaveBeenCalledWith(
      {
        status: 'failed',
        error: new Error('Failed !'),
      },
      {
        type: 'status.failed',
        source: query,
      }
    );

    expect(list.isLoading).toBe(false);
  });

  it('should resolve when current query completes', async () => {
    const list = $list(entity, 'test');

    // Refresh query
    const query = new Query<Test[]>();
    list.$list.refresh(() => query, 'replace');

    // Emit event
    setTimeout(() => query.complete([{ id: 'test', success: false }]), 0);

    await expect(list)
      .resolves.toEqual([{ id: 'test', success: false }]);
  });

  it('should resolve when current query fails', async () => {
    const list = $list(entity, 'test');

    // Refresh query
    const query = new Query<Test[]>();
    list.$list.refresh(() => query, 'replace');

    // Emit event
    setTimeout(() => query.fail(new Error('Failed !')), 0);

    await expect(list)
      .rejects.toEqual(new Error('Failed !'));
  });
});
