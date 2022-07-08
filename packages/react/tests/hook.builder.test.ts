import { $entity, $store, Item, List, Query } from '@jujulego/aegis';
import { act, renderHook } from '@testing-library/react';

import { $hook } from '../src';

// Types
interface TestEntity {
  id: string;
  success: boolean;
}

// Tests
describe('$hook().item', () => {
  it('should fetch item', () => {
    const query = new Query<TestEntity>();
    const fetch = jest.fn((arg: { id: 'test' }) => query);

    // Build entity
    const ent = $entity('test', $store.memory(), (itm: TestEntity) => itm.id)
      .$query('getById', fetch, (arg) => arg.id);

    const useTestEntity = $hook(ent).item('getById');

    // Render
    const { result } = renderHook(() => useTestEntity({ id: 'test' }));

    expect(fetch).toHaveBeenCalledWith({ id: 'test' });
    expect(result.current).toEqual({
      $id: 'test',
      $item: expect.any(Item),
      $entity: ent.$entity,

      isLoading: true,
      refresh: expect.any(Function),
    });

    // Query completed
    act(() => {
      query.complete({ id: 'test', success: true });
    });

    expect(result.current).toEqual({
      isLoading: false,
      data: { id: 'test', success: true },
      item: expect.any(Item),
      refresh: expect.any(Function),
    });
  });

  it('should refetch when refresh call', () => {
    let query: Query<TestEntity>;
    const fetch = jest.fn(() => query = new Query());

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$get('getById', fetch);

    const useTestEntity = $hook(ent).item('getById');

    // Render
    const { result } = renderHook(() => useTestEntity({ id: 'test' }));

    expect(fetch).toHaveBeenCalledTimes(1);

    // Complete & call refresh
    act(() => {
      query.complete({ id: 'test', success: true });
      result.current.refresh();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current).toEqual({
      isLoading: true,
      data: { id: 'test', success: true },
      item: expect.any(Item),
      refresh: expect.any(Function),
    });
  });

  it('should refetch when id changes', () => {
    const query = new Query<TestEntity>();
    const fetch = jest.fn(() => query);

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$get('getById', fetch);

    const useTestEntity = $hook(ent).item('getById');

    // Render
    const { result, rerender } = renderHook(({ id }) => useTestEntity({ id }), {
      initialProps: { id: 'test-1' },
    });

    expect(fetch).toHaveBeenCalledWith({ id: 'test-1' });
    expect(result.current).toEqual({
      isLoading: true,
      item: expect.any(Item),
      refresh: expect.any(Function),
    });

    // Rerender
    rerender({ id: 'test-2' });

    expect(fetch).toHaveBeenCalledWith({ id: 'test-2' });
    expect(result.current).toEqual({
      isLoading: true,
      item: expect.any(Item),
      refresh: expect.any(Function),
    });
  });
});

describe('$hook().list', () => {
  it('should fetch list', () => {
    const query = new Query<TestEntity[]>();
    const fetch = jest.fn((..._: [number, boolean]) => query);

    // Build entity
    const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id)
      .$list('listAll', fetch);

    const useTestEntity = $hook(ent).list('listAll', 'all');

    // Render
    const { result } = renderHook(() => useTestEntity(6, false));

    expect(fetch).toHaveBeenCalledWith(6, false);
    expect(result.current).toEqual({
      isLoading: true,
      data: [],
      list: expect.any(List),
      refresh: expect.any(Function),
    });

    // Query completed
    act(() => {
      query.complete([
        { id: 'test-1', success: true },
        { id: 'test-2', success: true },
      ]);
    });

    expect(result.current).toEqual({
      isLoading: false,
      data: [
        { id: 'test-1', success: true },
        { id: 'test-2', success: true },
      ],
      list: expect.any(List),
      refresh: expect.any(Function),
    });
  });
});
