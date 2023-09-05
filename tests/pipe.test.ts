import { vi } from 'vitest';

import { pipe$, var$ } from '@/src/index.js';

describe('pipe$', () => {
  it('should use op to prepare result', () => {
    const ref = var$('life');
    const op = vi.fn(() => var$(42));

    const result = pipe$(ref, op);

    expect(result.read()).toBe(42);
    expect(op).toHaveBeenCalledWith(ref, { off: result.off });
  });
});
