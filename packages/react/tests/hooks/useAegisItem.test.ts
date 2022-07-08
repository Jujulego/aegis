import { $entity, $store } from '@jujulego/aegis';
import { act, renderHook } from '@testing-library/react';

import { useAegisItem } from '../../src';

// Types
interface TestEntity {
  id: string;
  success: boolean;
}

// Setup
const ent = $entity('test', $store.memory(), (itm: TestEntity) => itm.id);

// Tests
describe('useAegisItem', () => {
  it('should return item data', () => {
    const itm = ent.$item('test-1');
    itm.data = {
      id: 'test-1',
      success: true
    };

    // Render
    const { result } = renderHook(() => useAegisItem(itm));

    expect(result.current).toEqual(itm);

    // Update
    act(() => {
      itm.data = {
        id: 'test-1',
        success: false
      };
    });

    expect(result.current).toEqual(itm);
  });
});
