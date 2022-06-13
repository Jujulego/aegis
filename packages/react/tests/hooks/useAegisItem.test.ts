import { act, renderHook } from '@testing-library/react';

import { $entity, $store, useAegisItem } from '../../src';

// Types
interface TestEntity {
  id: string;
  success: boolean;
}

// Setup
const ent = $entity<TestEntity>('test', $store.memory(), (itm) => itm.id);

// Tests
describe('useAegisItem', () => {
  it('should return item data', () => {
    const itm = ent.$entity.getItem('test-1');
    itm.data = {
      id: 'test-1',
      success: true
    };

    // Render
    const { result } = renderHook(() => useAegisItem(itm));

    expect(result.current).toEqual({
      isPending: false,
      data: {
        id: 'test-1',
        success: true
      }
    });

    // Update
    act(() => {
      itm.data = {
        id: 'test-1',
        success: false
      };
    });

    expect(result.current).toEqual({
      isPending: false,
      data: {
        id: 'test-1',
        success: false
      }
    });
  });
});
