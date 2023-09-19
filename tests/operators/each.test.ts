/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, vi } from 'vitest';

import { pipe$, each$, ref$, var$, const$ } from '@/src/index.js';

// Test
describe('each$', () => {
  it('should call fn on each value emitted by base', () => {
    const base = var$();
    const fn = vi.fn(() => 42);
    const spy = vi.fn();

    const ref = pipe$(base, each$(fn));
    ref.subscribe(spy);

    base.mutate('life');
    expect(fn).toHaveBeenCalledWith('life');
    expect(spy).toHaveBeenCalledWith(42);
  });

  describe('read', () => {
    it('should call fn with value read from base', () => {
      const base = const$('life');
      const fn = vi.fn(() => 42);

      const ref = pipe$(base, each$(fn));

      expect(ref.read()).toBe(42);
      expect(fn).toHaveBeenCalledWith('life');
    });

    it('should call fn with value resolved from base', async () => {
      const base = ref$(async () => 'life');
      const fn = vi.fn(() => 42);

      const ref = pipe$(base, each$(fn));

      await expect(ref.read()).resolves.toBe(42);
      expect(fn).toHaveBeenCalledWith('life');
    });
  });

  describe('mutate', () => {
    it('should call fn with mutate result from base', () => {
      const base = var$('life');
      const fn = vi.fn(() => 42);

      const ref = pipe$(base, each$(fn));

      expect(ref.mutate('toto')).toBe(42);
      expect(fn).toHaveBeenCalledWith('toto');
    });

    it('should call fn with mutate resolved result from base', async () => {
      const base = ref$({
        read: () => 'life',
        mutate: async (arg: string) => 'toto',
      });
      const fn = vi.fn(() => 42);

      const ref = pipe$(base, each$(fn));

      await expect(ref.mutate('toto')).resolves.toBe(42);
      expect(fn).toHaveBeenCalledWith('toto');
    });
  });
});
