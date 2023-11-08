import { beforeEach, expect } from 'vitest';

import { map$, RefMapFn, RefMap } from '@/src/containers/map.js';
import { SyncMutableRef } from '@/src/defs/mutable-ref.js';
import { var$ } from '@/src/refs/var.js';
import { ref$ } from '@/src/refs/index.js';

// Setup
let map: RefMap<string, number, SyncMutableRef<number>>;

beforeEach(() => {
  map = map$((key, value) => var$(value));
});

// Tests
describe('RefMap.get', () => {
  it('should return ref created for the same key', () => {
    const ref = map.set('life', 42);

    expect(map.get('life')).toBe(ref);
  });

  it('should return null if reference does not exist', () => {
    expect(map.get('life')).toBeNull();
  });
});

describe('RefMap.has', () => {
  it('should return true for created ref', () => {
    map.set('life', 42);

    expect(map.has('life')).toBe(true);
  });

  it('should return false for missing ref', () => {
    expect(map.has('life')).toBe(false);
  });
});

describe('RefMap.set', () => {
  let builder: RefMapFn<string, number, SyncMutableRef<number>>;

  beforeEach(() => {
    builder = vi.fn((key, value) => var$(value));
    map = map$(builder);
  });

  it('should use builder to create a reference to store value', () => {
    expect(map.set('life', 42)).not.toBeNull();
    expect(builder).toHaveBeenCalledWith('life', 42);
  });

  it('should use builder to create a reference only once', () => {
    const ref = map.set('life', 1);

    expect(map.set('life', 42)).toBe(ref);
    expect(ref.read()).toBe(42);
    expect(builder).toHaveBeenCalledOnce();
  });
});

describe('RefMap.delete', () => {
  it('should delete ref and return true', () => {
    map.set('life', 42);

    expect(map.delete('life')).toBe(true);
    expect(map.has('life')).toBe(false);
  });

  it('should return false as reference did not exist', () => {
    expect(map.delete('life')).toBe(false);
  });
});

describe('RefMap.clear', () => {
  it('should delete every refs', () => {
    map.set('life', 42);
    map.set('toto', 1);
    map.clear();

    expect(map.has('life')).toBe(false);
    expect(map.has('toto')).toBe(false);
  });
});

describe('RefMap.keys', () => {
  it('should return iterator on every stored keys', () => {
    map.set('life', 42);
    map.set('toto', 1);

    expect(Array.from(map.keys())).toStrictEqual(['life', 'toto']);
  });
});

describe('RefMap.references', () => {
  it('should return iterator on every stored references', () => {
    const ref1 = map.set('life', 42);
    const ref2 = map.set('toto', 1);

    expect(Array.from(map.references())).toStrictEqual([ref1, ref2]);
  });
});

describe('RefMap.values', () => {
  it('should return iterator on every stored values', () => {
    map.set('life', 42);
    map.set('toto', 1);

    expect(Array.from(map.values())).toStrictEqual([42, 1]);
  });

  it('should return async iterator on every stored values', async () => {
    const map = map$((key: string, val: number) => ref$<number, number>({
      read: async () => val,
      mutate: arg => arg
    }));

    map.set('life', 42);
    map.set('toto', 1);

    const values: number[] = [];

    for await (const val of map.values()) {
      values.push(val);
    }

    expect(values).toStrictEqual([42, 1]);
  });
});

describe('RefMap.entries', () => {
  it('should return iterator on every stored key-value pairs', () => {
    map.set('life', 42);
    map.set('toto', 1);

    expect(Array.from(map.entries())).toStrictEqual([['life', 42], ['toto', 1]]);
  });

  it('should return async iterator on every stored key-value pairs', async () => {
    const map = map$((key: string, val: number) => ref$<number, number>({
      read: async () => val,
      mutate: arg => arg
    }));

    map.set('life', 42);
    map.set('toto', 1);

    const entries: [string, number][] = [];

    for await (const val of map.entries()) {
      entries.push(val);
    }

    expect(entries).toStrictEqual([['life', 42], ['toto', 1]]);
  });
});

describe('RefMap.size', () => {
  it('should be 0 at start', () => {
    expect(map.size).toBe(0);
  });

  it('should be 2 at start', () => {
    map.set('life', 42);
    map.set('toto', 1);

    expect(map.size).toBe(2);
  });
});
