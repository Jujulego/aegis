import { vi } from 'vitest';

import { ref$ } from '@/src/index.js';

// Tests
describe('ref$', () => {
  describe('fn based', () => {
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
  });

  describe('opts based', () => {
    describe('synchronous', () => {
      it('should call read and return its result', () => {
        const read = vi.fn(() => 42);
        const mutate = vi.fn((v: string) => parseInt(v) + 1);

        const fn$ = ref$({ read, mutate });

        expect(fn$.read()).toBe(42);

        expect(read).toHaveBeenCalled();
        expect(mutate).not.toHaveBeenCalled();
      });

      it('should call mutate and return its result', () => {
        const read = vi.fn(() => 42);
        const mutate = vi.fn((v: string) => parseInt(v) + 1);

        const fn$ = ref$({ read, mutate });

        expect(fn$.mutate('1')).toBe(2);

        expect(read).not.toHaveBeenCalled();
        expect(mutate).toHaveBeenCalledWith('1');
      });
    });

    describe('asynchronous', () => {
      it('should call read and resolve to its result', async () => {
        const read = vi.fn(async () => 42);
        const mutate = vi.fn((v: string) => parseInt(v) + 1);

        const fn$ = ref$({ read, mutate });

        await expect(fn$.read()).resolves.toBe(42);

        expect(read).toHaveBeenCalled();
        expect(mutate).not.toHaveBeenCalled();
      });

      it('should call mutate and resolve to its result', async () => {
        const read = vi.fn(() => 42);
        const mutate = vi.fn(async (v: string) => parseInt(v) + 1);

        const fn$ = ref$({ read, mutate });

        await expect(fn$.mutate('1')).resolves.toBe(2);

        expect(read).not.toHaveBeenCalled();
        expect(mutate).toHaveBeenCalledWith('1');
      });
    });
  });

  describe('events', () => {
    it('should emit on next calls', () => {
      const spy = vi.fn();

      const fn$ = ref$(() => 42);
      fn$.subscribe(spy);

      fn$.next(1);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should emit each new result', () => {
      const spy = vi.fn();

      const fn$ = ref$({
        read: () => 42,
        mutate: (val: string) => parseInt(val) + 1
      });
      fn$.subscribe(spy);

      expect(fn$.read()).toBe(42);
      expect(fn$.read()).toBe(42);

      expect(spy).toHaveBeenCalledTimes(1); // <= because it is always the same value
      expect(spy).toHaveBeenCalledWith(42);
    });

    it('should emit after each mutate', () => {
      const spy = vi.fn();

      const fn$ = ref$({
        read: () => 42,
        mutate: (val: string) => parseInt(val) + 1
      });
      fn$.subscribe(spy);

      expect(fn$.read()).toBe(42);
      expect(fn$.mutate('1')).toBe(2);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(2);
      expect(spy).toHaveBeenCalledWith(42);
    });
  });
});
