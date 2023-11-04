import { expect, vi } from 'vitest';

import { registry$ } from '@/src/containers/registry.js';
import { const$ } from '@/src/refs/const.js';

// Tests
describe('registry$', () => {
  it('should use builder to create a reference', () => {
    const builder = vi.fn(() => const$(42));
    const registry = registry$(builder);
    registry.ref('life');

    expect(builder).toHaveBeenCalledWith('life');
  });

  it('should return the same reference for the same key', () => {
    const builder = vi.fn(() => const$(42));
    const registry = registry$(builder);

    expect(registry.ref('life')).toBe(registry.ref('life'));
    expect(builder).toHaveBeenCalledOnce();
  });

  it('should emit when a ref changes', () => {
    const registry = registry$(() => const$(42));
    const ref = registry.ref('life');

    const spy = vi.fn();
    registry.on('life', spy);

    ref.next(42);

    expect(spy).toHaveBeenCalledWith(42);
  });
});