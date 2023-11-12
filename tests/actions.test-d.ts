import { describe, expectTypeOf } from 'vitest';

import { actions$ } from '@/src/actions.js';
import { ref$ } from '@/src/refs/ref.js';
import { var$ } from '@/src/refs/var.js';

// Tests
describe('action$', () => {
  it('should return data for synchronous ref', () => {
    const ref = actions$(
      var$(42),
      { inc: (n: number) => (old) => old + n }
    );

    expectTypeOf(ref).toHaveProperty('inc');
    expectTypeOf(ref.inc).parameter(0).toBeNumber();
    expectTypeOf(ref.inc).returns.toBeNumber();
  });

  it('should resolve to data for asynchronous read ref', () => {
    const ref = actions$(
      ref$({
        read: async () => 42,
        mutate: (val: number) => val,
      }),
      { inc: (n: number) => (old) => old + n }
    );

    expectTypeOf(ref).toHaveProperty('inc');
    expectTypeOf(ref.inc).parameter(0).toBeNumber();
    expectTypeOf(ref.inc).returns.resolves.toBeNumber();
  });

  it('should resolve to data for asynchronous mutate ref', () => {
    const ref = actions$(
      ref$({
        read: () => 42,
        mutate: async (val: number) => val,
      }),
      { inc: (n: number) => (old) => old + n }
    );

    expectTypeOf(ref).toHaveProperty('inc');
    expectTypeOf(ref.inc).parameter(0).toBeNumber();
    expectTypeOf(ref.inc).returns.resolves.toBeNumber();
  });

  it('should resolve to data for asynchronous ref', () => {
    const ref = actions$(
      ref$({
        read: async () => 42,
        mutate: async (val: number) => val,
      }),
      { inc: (n: number) => (old) => old + n }
    );

    expectTypeOf(ref).toHaveProperty('inc');
    expectTypeOf(ref.inc).parameter(0).toBeNumber();
    expectTypeOf(ref.inc).returns.resolves.toBeNumber();
  });
});