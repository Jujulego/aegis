/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expectTypeOf } from 'vitest';

import { each$, pipe$, ref$, var$ } from '@/src/index.js';

// Tests
describe('each$', () => {
  describe('fn based', () => {
    it('should be an async readonly reference', () => {
      const ref = pipe$(
        var$(42),
        each$(async (val) => val.toString())
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.resolves.toBeString();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should be a sync readonly reference', () => {
      const ref = pipe$(
        var$(42),
        each$((val) => val.toString())
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.toBeString();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should not change read synchronicity of reference', () => {
      const ref = pipe$(
        ref$(async () => 42),
        each$((val) => val.toString()) // <= sync but result is still async because initial ref is async
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.resolves.toBeString();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });
  });

  describe('opts based', () => {
    it('should be an async readonly reference', () => {
      const ref = pipe$(
        var$(42),
        each$({ read: async (val) => val.toString() })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.resolves.toBeString();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should be a sync readonly reference', () => {
      const ref = pipe$(
        var$(42),
        each$({ read: (val) => val.toString() })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.toBeString();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should not change read synchronicity of reference', () => {
      const ref = pipe$(
        ref$(async () => 42),
        each$({ read: (val) => val.toString() }) // <= sync but result is still async because initial ref is async
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.resolves.toBeString();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should be an async readable async mutable reference', () => {
      const ref = pipe$(
        var$(42),
        each$({
          read: async (val) => val.toString(),
          mutate: async (arg: string) => parseInt(arg)
        })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.resolves.toBeString();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.resolves.toBeString();
    });

    it('should be an async readable async mutable reference (sync mutate mapper)', () => {
      const ref = pipe$(
        var$(42),
        each$({
          read: async (val) => val.toString(),
          mutate: (arg: string) => parseInt(arg) // <= sync but reference is still async mutable because read is used to map returned value
        })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.resolves.toBeString();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.resolves.toBeString();
    });

    it('should be an sync readable async mutable reference', () => {
      const ref = pipe$(
        var$(42),
        each$({
          read: (val) => val.toString(),
          mutate: async (arg: string) => parseInt(arg)
        })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.toBeString();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.resolves.toBeString();
    });

    it('should be an sync readable sync mutable reference', () => {
      const ref = pipe$(
        var$(42),
        each$({
          read: (val) => val.toString(),
          mutate: (arg: string) => parseInt(arg)
        })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.toBeString();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.toBeString();
    });

    it('should not change mutate synchronicity of reference', () => {
      const ref = pipe$(
        ref$({ read: () => 42, mutate: async (arg: number) => 42 }),
        each$({
          read: (val) => val.toString(),
          mutate: (arg: string) => parseInt(arg)
        })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.toBeString();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.resolves.toBeString();
    });

    it('should not change read synchronicity of reference (with mutate)', () => {
      const ref = pipe$(
        ref$({ read: async () => 42, mutate: (arg: number) => 42 }),
        each$({
          read: (val) => val.toString(),
          mutate: (arg: string) => parseInt(arg)
        })
      );

      expectTypeOf(ref.next).parameter(0).toBeString();
      expectTypeOf(ref.read).returns.resolves.toBeString();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.toBeString();
    });
  });
});
