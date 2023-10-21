import { vi } from 'vitest';

import { weak$ } from '@/src/refs/weak.js';

// Types
interface TestObj {
  life: number;
}

// Tests
describe('weak$', () => {
  it('should return undefined as start', () => {
    const spy = vi.fn();

    const life$ = weak$<TestObj>();
    life$.subscribe(spy);

    expect(life$.read()).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should return initial value', () => {
    const spy = vi.fn();

    const life$ = weak$({ life: 42 });
    life$.subscribe(spy);

    expect(life$.read()).toStrictEqual({ life: 42 });
    expect(spy).toHaveBeenCalledWith({ life: 42 });
  });

  it('should return mutated value', () => {
    const spy = vi.fn();

    const life$ = weak$<TestObj>();
    life$.subscribe(spy);

    expect(life$.mutate({ life: 42 })).toStrictEqual({ life: 42 });

    expect(life$.read()).toStrictEqual({ life: 42 });
    expect(spy).toHaveBeenCalledWith({ life: 42 });
  });
});
