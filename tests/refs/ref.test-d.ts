/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expectTypeOf } from 'vitest';

import { ref$ } from '@/src/index.js';

// Tests
describe('ref$', () => {
  describe('fn based', () => {
    it('should be an async readonly reference', () => {
      const ref = ref$(async () => 42);

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.resolves.toBeNumber();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should be a sync readonly reference', () => {
      const ref = ref$(() => 42);

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.toBeNumber();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });
  });

  describe('opts based', () => {
    it('should be an async readonly reference', () => {
      const ref = ref$({ read: async () => 42 });

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.resolves.toBeNumber();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should be a sync readonly reference', () => {
      const ref = ref$({ read: () => 42 });

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.toBeNumber();
      expectTypeOf(ref).not.toHaveProperty('mutate');
    });

    it('should be an async readable async mutable reference', () => {
      const ref = ref$({
        read: async () => 42,
        mutate: async (arg: 'life') => 42
      });

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.resolves.toBeNumber();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.resolves.toBeNumber();
    });

    it('should be an async readable sync mutable reference', () => {
      const ref = ref$({
        read: async () => 42,
        mutate: (arg: 'life') => 42
      });

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.resolves.toBeNumber();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.toBeNumber();
    });

    it('should be an sync readable async mutable reference', () => {
      const ref = ref$({
        read: () => 42,
        mutate: async (arg: 'life') => 42
      });

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.toBeNumber();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.resolves.toBeNumber();
    });

    it('should be an sync readable sync mutable reference', () => {
      const ref = ref$({
        read: () => 42,
        mutate: (arg: 'life') => 42
      });

      expectTypeOf(ref.next).parameter(0).toBeNumber();
      expectTypeOf(ref.read).returns.toBeNumber();
      expectTypeOf(ref.mutate).parameter(0).toBeString();
      expectTypeOf(ref.mutate).returns.toBeNumber();
    });
  });
});
