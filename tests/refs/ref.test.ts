import { vi } from 'vitest';

import { ref$ } from '@/src/index.js';

// Tests
describe('ref$', () => {
  it('should call fn and return its result', () => {
    const fn = vi.fn(() => 42);
    const fn$ = ref$(fn);

    expect(fn$.read()).toBe(42);
    expect(fn).toHaveBeenCalled();
  });

  it('should call fn and resolve to its result', async () => {
    const fn = vi.fn(async () => 42);
    const fn$ = ref$(fn);

    await expect(fn$.read()).resolves.toBe(42);
    expect(fn).toHaveBeenCalled();
  });

  it('should emit each new result', () => {
    const spy = vi.fn();

    const fn$ = ref$(() => 42);
    fn$.subscribe(spy);

    expect(fn$.read()).toBe(42);
    expect(fn$.read()).toBe(42);

    expect(spy).toHaveBeenCalledTimes(1); // <= because it is always the same value
    expect(spy).toHaveBeenCalledWith(42);
  });

  it('should emit on next calls', () => {
    const spy = vi.fn();

    const fn$ = ref$(() => 42);
    fn$.subscribe(spy);

    fn$.next(1);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(1);
  });
});
