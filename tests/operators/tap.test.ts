import { source$ } from '@jujulego/event-tree';
import { vi } from 'vitest';

import { pipe$, tap$ } from '@/src/index.js';

// Tests
describe('tap$', () => {
  it('should call fn on each emitted value', () => {
    const base = source$<number>();
    const fn = vi.fn();

    pipe$(base, tap$(fn));
    base.next(42);

    expect(fn).toHaveBeenCalledWith(42);
  });
});
