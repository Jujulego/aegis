import { vi } from 'vitest';

import { const$, pipe$ } from '@/src/index.js';

describe('pipe$', () => {
  it('should use op to prepare result', () => {
    const ref = const$('life');
    const op = vi.fn(() => const$(42));

    const result = pipe$(ref, op);

    expect(result.read()).toBe(42);
    expect(op).toHaveBeenCalledWith(ref, { off: result.off });
  });
});
