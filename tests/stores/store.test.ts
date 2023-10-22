import { vi } from 'vitest';

import { store$, var$ } from '@/src/index.js';

// Tests
describe('store$(...).ref', () => {
  it('should return a reference on the key element', () => {
    const builder = vi.fn(() => var$(42));
    const store = store$(builder);

    expect(store.ref('life').read()).toBe(42);
    expect(builder).toHaveBeenCalledWith('life');
  });

  it('should return the same reference on the same element', () => {
    const store = store$(() => var$(42));

    expect(store.ref('life')).toBe(store.ref('life'));
  });

  it('should emit each element mutation', () => {
    const spy = vi.fn();

    const store = store$(() => var$());
    store.on('life', spy);

    store.ref('life').mutate(42);

    expect(store.ref('life').read()).toBe(42);
    expect(spy).toHaveBeenCalledWith(42);
  });
});

describe('store$(...).mutate', () => {
  it('should mutate the key element', () => {
    const ref = var$();
    vi.spyOn(ref, 'mutate');

    const store = store$(() => ref);
    store.mutate('life', 42);

    expect(ref.mutate).toHaveBeenCalledWith(42);
  });

  it('should emit each element mutation', () => {
    const spy = vi.fn();

    const store = store$(() => var$());
    store.on('life', spy);

    store.mutate('life', 42);

    expect(store.ref('life').read()).toBe(42);
    expect(spy).toHaveBeenCalledWith(42);
  });
});

describe('store$(...).trigger', () => {
  it('should triggers references on the key element', () => {
    const spy = vi.fn();

    const store = store$(() => var$());
    store.on('life', spy);
    store.trigger('life', 42);

    expect(spy).toHaveBeenCalledWith(42);
  });

  it('should not trigger the key element if no reference to it exists', () => {
    const ref = var$();
    vi.spyOn(ref, 'next');

    const store = store$(() => ref);
    store.trigger('life', 42);

    expect(ref.next).not.toHaveBeenCalled();
  });
});
