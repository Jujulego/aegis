import { vi } from 'vitest';

import { pipe$, each$, ref$, var$, const$ } from '@/src/index.js';

// Test
describe('map$', () => {
  it('should call fn on read with value read from arg', () => {
    const arg = const$('life');
    const fn = vi.fn(() => 42);

    const ref = pipe$(arg, each$(fn));

    expect(ref.read()).toBe(42);
    expect(fn).toHaveBeenCalledWith('life');
  });

  it('should call fn on read with value resolved from arg', async () => {
    const arg = ref$(async () => 'life');
    const fn = vi.fn(() => 42);

    const ref = pipe$(arg, each$(fn));

    await expect(ref.read()).resolves.toBe(42);
    expect(fn).toHaveBeenCalledWith('life');
  });

  it('should call fn on each value emitted by arg', () => {
    const arg = var$();
    const fn = vi.fn(() => 42);
    const spy = vi.fn();

    const ref = pipe$(arg, each$(fn));
    ref.subscribe(spy);

    arg.mutate('life');
    expect(fn).toHaveBeenCalledWith('life');
    expect(spy).toHaveBeenCalledWith(42);
  });
});
