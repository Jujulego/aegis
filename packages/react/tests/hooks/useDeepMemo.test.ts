import { renderHook } from '@testing-library/react';

import { useDeepMemo } from '../../src';

// Tests
describe('useDeepMemo', () => {
  it('should return previous value', () => {
    // Render
    const obj = { test: 1 };
    const { result, rerender } = renderHook(({ object }) => useDeepMemo(object), {
      initialProps: { object: obj }
    });

    // Checks
    expect(result.current).toBe(obj);

    // Update prop (same value object)
    rerender({ object: { test: 1 } });
    expect(result.current).toBe(obj);

    // Update prop (different value)
    rerender({ object: { test: 5 } });
    expect(result.current).toEqual({ test: 5 });
  });
});
