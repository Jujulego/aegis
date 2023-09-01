import { vi } from 'vitest';

import { storage$ } from '@/src/index.js';
import { Listener } from '@jujulego/event-tree';

// Setup
// @vitest-environment jsdom
beforeEach(() => {
  localStorage.clear();
});

// Tests
describe('storage$', () => {
  it('should return readable reference on given storage value', () => {
    localStorage.setItem('test:life', JSON.stringify({ value: 42 }));

    const storage = storage$(localStorage, 'test');
    const ref = storage.ref('life');

    expect(ref.read()).toEqual({ value: 42 });
  });

  it('should return coherent values', () => {
    localStorage.setItem('test:life', JSON.stringify({ value: 42 }));

    const storage = storage$(localStorage, 'test');
    const ref = storage.ref('life');

    expect(ref.read()).toBe(ref.read());
  });

  it('should return mutable reference on given storage value', () => {
    const storage = storage$(localStorage, 'test');
    const ref = storage.ref('life');

    ref.mutate({ value: 42 });

    expect(localStorage.getItem('test:life')).toBe(JSON.stringify({ value: 42 }));
  });

  it('should emit storage events from window', () => {
    // Listener setup
    vi.spyOn(window, 'addEventListener');
    const storage = storage$(localStorage, 'test');

    expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));

    // Events
    const spy = vi.fn();
    storage.on('life', spy);

    const callback = vi.mocked(window.addEventListener).mock.calls[0]![1] as Listener<StorageEvent>;
    callback({
      storageArea: localStorage,
      key: 'test:life',
      newValue: JSON.stringify({ value: 42 })
    } as StorageEvent);

    expect(spy).toHaveBeenCalledWith({ value: 42 });
  });
});
