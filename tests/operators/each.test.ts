import { describe, vi } from 'vitest';

import { pipe$, each$, ref$, var$, const$ } from '@/src/index.js';

// Test
describe('each$', () => {
  describe('fn based', () => {
    it('should call fn on read with value read from arg', () => {
      const arg = const$('life');
      const fn = vi.fn(() => 42);

      const ref = pipe$(arg, each$(fn));

      expect(ref.read()).toBe(42);
      expect(fn).toHaveBeenCalledWith('life');
    });

    it('should call fn on read with value resolved from arg', async () => {
      const arg = ref$(async () => 'life');
      const fn = vi.fn(() => 42);

      const ref = pipe$(arg, each$(fn));

      await expect(ref.read()).resolves.toBe(42);
      expect(fn).toHaveBeenCalledWith('life');
    });

    it('should call fn on each value emitted by arg', () => {
      const arg = var$();
      const fn = vi.fn(() => 42);
      const spy = vi.fn();

      const ref = pipe$(arg, each$(fn));
      ref.subscribe(spy);

      arg.mutate('life');
      expect(fn).toHaveBeenCalledWith('life');
      expect(spy).toHaveBeenCalledWith(42);
    });
  });

  describe('opts based', () => {
    it('should call opts.read on read with value read from arg', () => {
      const arg = const$('life');
      const opts = {
        read: vi.fn(() => 42)
      };

      const ref = pipe$(arg, each$(opts));

      expect(ref.read()).toBe(42);
      expect(opts.read).toHaveBeenCalledWith('life');
    });

    it('should call opts.read on read with value resolved from arg', async () => {
      const arg = ref$({ read: async () => 'life' });
      const opts = {
        read: vi.fn(() => 42)
      };

      const ref = pipe$(arg, each$(opts));

      await expect(ref.read()).resolves.toBe(42);
      expect(opts.read).toHaveBeenCalledWith('life');
    });

    it('should call opts.mutate on mutate its result should be passed to arg', () => {
      const arg = var$('life');
      vi.spyOn(arg, 'mutate');

      const opts = {
        read: vi.fn(() => 42),
        mutate: vi.fn((a: string) => `${a} life`)
      };

      const ref = pipe$(arg, each$(opts));

      expect(ref.mutate('toto')).toBe(42);
      expect(opts.mutate).toHaveBeenCalledWith('toto');
      expect(arg.mutate).toHaveBeenCalledWith('toto life');
    });

    it('should call opts.mutate on mutate its result should be passed to arg (async)', async () => {
      const arg = ref$({ read: () => 'life', mutate: async () => 'life' });
      vi.spyOn(arg, 'mutate');

      const opts = {
        read: vi.fn(() => 42),
        mutate: vi.fn((a: string) => `${a} life`)
      };

      const ref = pipe$(arg, each$(opts));

      await expect(ref.mutate('toto')).resolves.toBe(42);
      expect(opts.mutate).toHaveBeenCalledWith('toto');
      expect(arg.mutate).toHaveBeenCalledWith('toto life');
    });

    it('should call opts.read on each value emitted by arg', () => {
      const arg = var$();
      const spy = vi.fn();

      const opts = {
        read: vi.fn(() => 42),
        mutate: vi.fn((a: string) => `${a} life`)
      };

      const ref = pipe$(arg, each$(opts));
      ref.subscribe(spy);

      arg.mutate('life');
      expect(opts.read).toHaveBeenCalledWith('life');
      expect(spy).toHaveBeenCalledWith(42);
    });
  });
});
