import { vi } from 'vitest';

import { var$, watch$ } from '@/src/index.js';

// Tests
describe('watch$', () => {
  it('should call fn when the reference changes', () => {
    const ref = var$<number>();
    const fn = vi.fn();

    watch$(ref, fn);
    ref.mutate(42);

    expect(fn).toHaveBeenCalledWith(42);
  });

  it('should call cb before next fn call', () => {
    const ref = var$<number>();
    const cb = vi.fn();

    watch$(ref, () => cb);
    ref.mutate(41);

    expect(cb).not.toHaveBeenCalled();

    ref.mutate(42);

    expect(cb).toHaveBeenCalled();
  });

  it('should not call fn if off has been called', () => {
    const ref = var$<number>();
    const fn = vi.fn();

    const off = watch$(ref, fn);
    off();

    ref.mutate(42);

    expect(fn).not.toHaveBeenCalled();
  });
});