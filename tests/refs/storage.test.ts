import { Listener } from '@jujulego/event-tree';
import { expect, vi } from 'vitest';

import { storage$ } from '@/src/refs/storage.js';

// Setup
// @vitest-environment jsdom
beforeEach(() => {
  localStorage.clear();
});

// Tests
describe('storage$', () => {
  it('should set initial value if key misses in storage', () => {
    storage$<number>(localStorage, 'life', 42);

    expect(localStorage.getItem('life')).toBe('42');
  });

  it('should return readable reference on storage item', () => {
    localStorage.setItem('life', JSON.stringify(42));

    const ref = storage$<number>(localStorage, 'life');

    expect(ref.read()).toBe(42);
  });

  it('should read null if key misses in storage', () => {
    const ref = storage$<number>(localStorage, 'life');

    expect(ref.read()).toBeNull();
  });

  it('should return mutable reference on storage item', () => {
    const ref = storage$<number>(localStorage, 'life');
    ref.mutate(42);

    expect(localStorage.getItem('life')).toBe(JSON.stringify(42));
  });

  it('should remove key from storage if mutated to null', () => {
    localStorage.setItem('life', JSON.stringify(42));

    const ref = storage$<number>(localStorage, 'life');
    ref.mutate(null);

    expect(localStorage.getItem('life')).toBeNull();
  });

  it('should listen to window storage events', () => {
    // Listener setup
    vi.spyOn(window, 'addEventListener');
    const ref = storage$<number>(localStorage, 'life');

    expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    const callback = vi.mocked(window.addEventListener).mock.calls[0]![1] as Listener<StorageEvent>;

    // Subscribe to ref
    const spy = vi.fn();
    ref.subscribe(spy);

    // Emit update event
    callback({ storageArea: localStorage, key: 'life', newValue: JSON.stringify(42) } as StorageEvent);
    expect(spy).toHaveBeenCalledWith(42);

    // Emit remove event
    callback({ storageArea: localStorage, key: 'life', newValue: null } as StorageEvent);
    expect(spy).toHaveBeenCalledWith(null);
  });
});
