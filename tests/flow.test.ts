import { Observable, source$ } from '@jujulego/event-tree';
import { vi } from 'vitest';

import { PipeContext } from '@/src/defs/pipe.js';
import { flow$ } from '@/src/flow.js';

describe('flow$', () => {
  it('should pass down result from op to receiver at the end', () => {
    const ref = source$<string>();
    const op = vi.fn((base: Observable<string>, { off }: PipeContext) => {
      const res = source$<number>();
      off.add(base.subscribe((v) => res.next(parseInt(v))));

      return res;
    });
    const rcv = source$();
    vi.spyOn(rcv, 'next');

    // Setup flow
    const off = flow$(ref, op, rcv);

    expect(op).toHaveBeenCalledWith(ref, { off });

    // Emit some data
    ref.next('42');

    expect(rcv.next).toHaveBeenCalledWith(42);
  });
});
