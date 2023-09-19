import { source$ } from '@jujulego/event-tree';
import { describe, expectTypeOf } from 'vitest';

import { filter$, pipe$ } from '@/src/index.js';

// Tests
describe('filter$', () => {
  it('should use type from predicate', () => {
    const ref = pipe$(
      source$<number | string>(),
      filter$((arg): arg is number => typeof arg === 'number')
    );

    expectTypeOf(ref.next).parameter(0).toBeNumber();
    expectTypeOf(ref).not.toHaveProperty('read');
    expectTypeOf(ref).not.toHaveProperty('mutate');
  });
});