import { act, renderHook } from '@testing-library/react';

import { $entity, $store, $itemHook, AegisQuery, AegisItem } from '../src';

// Types
interface TestEntity {
  id: string;
  success: boolean;
}

// Tests
describe('$itemHook', () => {
  it('should fetch item', () => {
    const query = new AegisQuery<TestEntity>();
    const fetch = jest.fn((id: string) => query);

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$get('getById', fetch);

    const useTestEntity = $itemHook(ent, 'getById');

    // Render
    const { result } = renderHook(() => useTestEntity('test'));

    expect(fetch).toHaveBeenCalledWith('test');
    expect(result.current).toEqual({
      isPending: true,
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });

    // Query completed
    act(() => {
      query.store({ id: 'test', success: true });
    });

    expect(result.current).toEqual({
      isPending: false,
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

    const useTestEntity = $itemHook(ent, 'getById');

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
      isPending: true,
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

    const useTestEntity = $itemHook(ent, 'getById');

    // Render
    const { result, rerender } = renderHook(({ id }) => useTestEntity(id), {
      initialProps: { id: 'test-1', },
    });

    expect(fetch).toHaveBeenCalledWith('test-1');
    expect(result.current).toEqual({
      isPending: true,
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });

    // Rerender
    rerender({ id: 'test-2' });

    expect(fetch).toHaveBeenCalledWith('test-2');
    expect(result.current).toEqual({
      isPending: true,
      item: expect.any(AegisItem),
      refresh: expect.any(Function),
    });
  });
});
