import { act, renderHook } from '@testing-library/react';

import { $entity, $hook, $store, AegisQuery, AegisItem, AegisList } from '../src';

// Types
interface TestEntity {
  id: string;
  success: boolean;
}

// Tests
describe('$hook().item', () => {
  it('should fetch item', () => {
    const query = new AegisQuery<TestEntity>();
    const fetch = jest.fn((id: string) => query);

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$get('getById', fetch);

    const useTestEntity = $hook(ent).item('getById');

    // Render
    const { result } = renderHook(() => useTestEntity('test'));

    expect(fetch).toHaveBeenCalledWith('test');
    expect(result.current).toEqual({
      status: 'pending',
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });

    // Query completed
    act(() => {
      query.store({ id: 'test', success: true });
    });

    expect(result.current).toEqual({
      status: 'completed',
      data: { id: 'test', success: true },
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });
  });

  it('should refetch when refresh call', () => {
    let query: AegisQuery<TestEntity>;
    const fetch = jest.fn((id: string) => query = new AegisQuery());

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$get('getById', fetch);

    const useTestEntity = $hook(ent).item('getById');

    // Render
    const { result } = renderHook(() => useTestEntity('test'));

    expect(fetch).toHaveBeenCalledTimes(1);

    // Complete & call refresh
    act(() => {
      query.store({ id: 'test', success: true });
      result.current.refresh();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current).toEqual({
      status: 'pending',
      data: { id: 'test', success: true },
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });
  });

  it('should refetch when id changes', () => {
    const query = new AegisQuery<TestEntity>();
    const fetch = jest.fn((id: string) => query);

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$get('getById', fetch);

    const useTestEntity = $hook(ent).item('getById');

    // Render
    const { result, rerender } = renderHook(({ id }) => useTestEntity(id), {
      initialProps: { id: 'test-1', },
    });

    expect(fetch).toHaveBeenCalledWith('test-1');
    expect(result.current).toEqual({
      status: 'pending',
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });

    // Rerender
    rerender({ id: 'test-2' });

    expect(fetch).toHaveBeenCalledWith('test-2');
    expect(result.current).toEqual({
      status: 'pending',
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });
  });
});

describe('$hook().list', () => {
  it('should fetch list', () => {
    const query = new AegisQuery<TestEntity[]>();
    const fetch = jest.fn((..._: [number, boolean]) => query);

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$list('listAll', fetch);

    const useTestEntity = $hook(ent).list('listAll', 'all');

    // Render
    const { result } = renderHook(() => useTestEntity(6, false));

    expect(fetch).toHaveBeenCalledWith(6, false);
    expect(result.current).toEqual({
      status: 'pending',
      data: [],
      list: expect.any(AegisList),
      refresh: expect.any(Function),
    });

    // Query completed
    act(() => {
      query.store([
        { id: 'test-1', success: true },
        { id: 'test-2', success: true },
      ]);
    });

    expect(result.current).toEqual({
      status: 'completed',
      data: [
        { id: 'test-1', success: true },
        { id: 'test-2', success: true },
      ],
      list: expect.any(AegisList),
      refresh: expect.any(Function),
    });
  });
});
