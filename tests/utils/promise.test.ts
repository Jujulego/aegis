import { Query } from '@jujulego/utils';

import { awaitedCall, isPromise } from '@/src/utils/promise.js';

// Tests
describe('isPromise', () => {
  it('should return true for a promise', () => {
    const promise = new Promise(() => null);

    expect(isPromise(promise)).toBe(true);
  });

  it('should return true for a query', () => {
    const query = new Query();

    expect(isPromise(query)).toBe(true);
  });

  it('should return false for anything else', () => {
    expect(isPromise(true)).toBe(false);
    expect(isPromise(42)).toBe(false);
    expect(isPromise('life')).toBe(false);
    expect(isPromise({ life: 42 })).toBe(false);
    expect(isPromise(['life', 42])).toBe(false);
    expect(isPromise(() => 42)).toBe(false);
  });
});

describe('awaitedCall', () => {
  it('should fn with given arg without creating a promise', () => {
    const fn = vi.fn(() => 42);

    expect(awaitedCall('life', fn)).toBe(42);
    expect(fn).toHaveBeenCalledWith('life');
  });

  it('should fn with resolved arg', async () => {
    const fn = vi.fn(() => 42);

    await expect(awaitedCall(Promise.resolve('life'), fn)).resolves.toBe(42);
    expect(fn).toHaveBeenCalledWith('life');
  });
});
