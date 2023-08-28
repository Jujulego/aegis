import { ref$ } from '@/src/index.js';
import { vi } from 'vitest';

// Tests
describe('ref$', () => {
  describe('synchronous', () => {
    it('should call fn and return its result', () => {
      const fn = vi.fn(() => 42);
      const fn$ = ref$(fn);

      expect(fn$.read()).toBe(42);
      expect(fn).toHaveBeenCalled();
    });

    it('should call read and return its result', () => {
      const read = vi.fn(() => 42);
      const fn$ = ref$({ read });

      expect(fn$.read()).toBe(42);
      expect(read).toHaveBeenCalled();
    });

    it('should call mutate and return its result', () => {
      const mutate = vi.fn((v) => v);
      const fn$ = ref$({
        read: () => 42,
        mutate
      });

      expect(fn$.mutate(42)).toBe(42);
      expect(mutate).toHaveBeenCalledWith(42);
    });
  });

  describe('asynchronous', () => {
    it('should call fn and resolve to its result', async () => {
      const fn = vi.fn(async () => 42);
      const fn$ = ref$(fn);

      await expect(fn$.read()).resolves.toBe(42);
      expect(fn).toHaveBeenCalled();
    });

    it('should call read and resolve to its result', async () => {
      const read = vi.fn(async () => 42);
      const fn$ = ref$({ read });

      await expect(fn$.read()).resolves.toBe(42);
      expect(read).toHaveBeenCalled();
    });

    it('should call mutate and resolve to its result', async () => {
      const mutate = vi.fn(async (v) => v);
      const fn$ = ref$({
        read: async () => 42,
        mutate
      });

      await expect(fn$.mutate(42)).resolves.toBe(42);
      expect(mutate).toHaveBeenCalledWith(42);
    });
  });

  it('should emit each new result', () => {
    const spy = vi.fn();

    const fn$ = ref$(() => 42);
    fn$.subscribe(spy);

    expect(fn$.read()).toBe(42);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(42);
  });

  it('should emit after mutation', () => {
    const spy = vi.fn();

    const fn$ = ref$({
      read: () => 42,
      mutate: (v: string) => parseInt(v) + 1,
    });
    fn$.subscribe(spy);

    expect(fn$.read()).toBe(42);
    expect(fn$.mutate('1')).toBe(2);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(42);
    expect(spy).toHaveBeenCalledWith(2);
  });
});
