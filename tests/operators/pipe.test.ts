import { vi } from 'vitest';

import { pipe$, var$ } from '@/src/index.js';

describe('pipe$', () => {
  it('should call op on read', () => {
    const ref = var$('life');
    const op = vi.fn(() => 42);

    const result = pipe$(ref, op);

    expect(result.read()).toBe(42);
    expect(op).toHaveBeenCalledWith('life');
  });

  it('should call async op on read', async () => {
    const ref = var$('life');
    const op = vi.fn(async () => 42);

    const result = pipe$(ref, op);

    await expect(result.read()).resolves.toBe(42);
    expect(op).toHaveBeenCalledWith('life');
  });

  it('should call op on new value', () => {
    const ref = var$<string>();
    const op = vi.fn(() => 42);
    const next = vi.fn();

    const result = pipe$(ref, op);
    result.subscribe(next);

    ref.mutate('life');
    expect(op).toHaveBeenCalledWith('life');
    expect(next).toHaveBeenCalledWith(42);
  });

  it('should call async op on new value', async () => {
    const ref = var$<string>();
    const op = vi.fn(async () => 42);
    const next = vi.fn();

    const result = pipe$(ref, op);
    result.subscribe(next);

    ref.mutate('life');
    await new Promise((reject) => setTimeout(reject, 0));

    expect(op).toHaveBeenCalledWith('life');
    expect(next).toHaveBeenCalledWith(42);
  });
});
