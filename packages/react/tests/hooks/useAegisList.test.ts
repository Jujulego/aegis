import { act, renderHook } from '@testing-library/react';

import { $entity, $store, useAegisList } from '../../src';

// Types
interface TestEntity {
  id: string;
  success: boolean;
}

// Setup
const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id);

// Tests
describe('useAegisList', () => {
  it('should return list data', () => {
    const lst = ent.$entity.list('all');
    lst.data = [
      { id: 'test-1', success: true },
      { id: 'test-2', success: true }
    ];

    // Render
    const { result } = renderHook(() => useAegisList(lst));

    expect(result.current).toEqual({
      status: 'pending',
      data: [
        { id: 'test-1', success: true },
        { id: 'test-2', success: true }
      ],
    });

    // Update
    act(() => {
      lst.data = [
        { id: 'test-1', success: false },
        { id: 'test-3', success: true }
      ];
    });

    expect(result.current).toEqual({
      status: 'pending',
      data: [
        { id: 'test-1', success: false },
        { id: 'test-3', success: true }
      ],
    });
  });
});
