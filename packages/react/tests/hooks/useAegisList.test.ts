import { act, renderHook } from '@testing-library/react';

import { $entity, $store, useAegisList } from '../../src';

// Setup
const ent = $entity<string>('test', $store.memory(), (itm) => itm);

// Tests
describe('useAegisList', () => {
  it('should return item data', () => {
    const lst = ent.$entity.getList('all');
    lst.data = ['test-1', 'test-2'];

    // Render
    const { result } = renderHook(() => useAegisList(lst));

    expect(result.current).toEqual(['test-1', 'test-2']);

    // Update
    act(() => {
      lst.data = ['test-3'];
    });

    expect(result.current).toEqual(['test-3']);
  });
});
