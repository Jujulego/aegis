import { ref$ } from '@/src/index.js';
import { vi } from 'vitest';

// Tests
describe('ref$', () => {
  it('should call fn and return its result', () => {
    const fn = vi.fn(() => 42);
    const fn$ = ref$(fn);

    expect(fn$.read()).toBe(42);
    expect(fn).toHaveBeenCalled();
  });

  it('should call fn and resolve its result', async () => {
    const fn = vi.fn(async () => 42);
    const fn$ = ref$(fn);

    await expect(fn$.read()).resolves.toBe(42);
    expect(fn).toHaveBeenCalled();
  });

  it('should emit each new result', () => {
    const fn = vi.fn(() => 42);
    const spy = vi.fn();

    const fn$ = ref$(fn);
    fn$.subscribe(spy);

    expect(fn$.read()).toBe(42);
    expect(fn$.read()).toBe(42);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(42);
  });
});
