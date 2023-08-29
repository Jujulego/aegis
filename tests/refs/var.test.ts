import { vi } from 'vitest';

import { var$ } from '@/src/index.js';

// Tests
describe('var$', () => {
  it('should return undefined as start', () => {
    const spy = vi.fn();

    const life$ = var$<number>();
    life$.subscribe(spy);

    expect(life$.read()).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should return initial value', () => {
    const spy = vi.fn();

    const life$ = var$(42);
    life$.subscribe(spy);

    expect(life$.read()).toBe(42);
    expect(spy).toHaveBeenCalledWith(42);
  });

  it('should return mutated value', () => {
    const spy = vi.fn();

    const life$ = var$<number>();
    life$.subscribe(spy);

    expect(life$.mutate(42)).toBe(42);

    expect(life$.read()).toBe(42);
    expect(spy).toHaveBeenCalledWith(42);
  });
});
