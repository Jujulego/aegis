/* eslint-disable @typescript-eslint/no-unused-vars */
import { source$ } from '@jujulego/event-tree';
import { describe, expectTypeOf } from 'vitest';

import { const$, each$, pipe$, ref$, var$ } from '@/src/index.js';

// Tests
describe('each$', () => {
  it('should be a simple source', () => {
    const ref = pipe$(
      source$<number>(),
      each$((val) => val.toString())
    );

    expectTypeOf(ref.next).parameter(0).toBeString();
    expectTypeOf(ref).not.toHaveProperty('read');
    expectTypeOf(ref).not.toHaveProperty('mutate');
  });

  it('should be a sync readonly reference', () => {
    const ref = pipe$(
      const$(42),
      each$((val) => val.toString())
    );

    expectTypeOf(ref.next).parameter(0).toBeString();
    expectTypeOf(ref.read).returns.toBeString();
    expectTypeOf(ref).not.toHaveProperty('mutate');
  });

  it('should be a sync reference', () => {
    const ref = pipe$(
      var$(42),
      each$((val) => val.toString())
    );

    expectTypeOf(ref.next).parameter(0).toBeString();
    expectTypeOf(ref.read).returns.toBeString();
    expectTypeOf(ref.mutate).parameter(0).toBeNumber();
    expectTypeOf(ref.mutate).returns.toBeString();
  });

  it('should be an async reference', () => {
    const ref = pipe$(
      var$(42),
      each$(async (val) => val.toString())
    );

    expectTypeOf(ref.next).parameter(0).toBeString();
    expectTypeOf(ref.read).returns.resolves.toBeString();
    expectTypeOf(ref.mutate).parameter(0).toBeNumber();
    expectTypeOf(ref.mutate).returns.resolves.toBeString();
  });

  it('should not change read synchronicity of reference', () => {
    const ref = pipe$(
      ref$({
        read: async () => 42,
        mutate: (arg: number) => 42
      }),
      each$((val) => val.toString()) // <= sync but result is still async because initial ref is async
    );

    expectTypeOf(ref.next).parameter(0).toBeString();
    expectTypeOf(ref.read).returns.resolves.toBeString();
    expectTypeOf(ref.mutate).parameter(0).toBeNumber();
    expectTypeOf(ref.mutate).returns.toBeString();
  });

  it('should not change mutate synchronicity of reference', () => {
    const ref = pipe$(
      ref$({
        read: () => 42,
        mutate: async (arg: number) => 42
      }),
      each$((val) => val.toString()) // <= sync but result is still async because initial ref is async
    );

    expectTypeOf(ref.next).parameter(0).toBeString();
    expectTypeOf(ref.read).returns.toBeString();
    expectTypeOf(ref.mutate).parameter(0).toBeNumber();
    expectTypeOf(ref.mutate).returns.resolves.toBeString();
  });
});
