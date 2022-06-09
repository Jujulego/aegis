import { renderHook } from '@testing-library/react';

import { $entity, $store, useAegisItem } from '../../src';

// Setup
const ent = $entity<string>('test', $store.memory(), (itm) => itm);

// Tests
describe('useAegisItem', () => {
  it('should return item data', () => {
    const itm = ent.$entity.getItem('test-1');
    itm.data = 'test-1';

    // Render
    const { result } = renderHook(() => useAegisItem(itm));

    expect(result.current).toBe('test-1');
  });
});
