import { Observable, source$ } from '@jujulego/event-tree';
import { vi } from 'vitest';

import { PipeContext } from '@/src/defs/pipe.js';
import { pipe$ } from '@/src/pipe.js';

describe('pipe$', () => {
  it('should use op to prepare result', () => {
    const ref = source$<string>();
    const op = vi.fn((base: Observable<string>, { off }: PipeContext) => {
      const res = source$<number>();
      off.add(base.subscribe((v) => res.next(parseInt(v))));

      return res;
    });
    const spy = vi.fn();

    // Setup pipe
    const result = pipe$(ref, op);

    expect(op).toHaveBeenCalledWith(ref, { off: result.off });

    // Emit some data
    result.subscribe(spy);
    ref.next('42');

    expect(spy).toHaveBeenCalledWith(42);
  });
});
