import { Query } from '@jujulego/utils';

import { isPromise } from '@/src/utils/promise.js';

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
