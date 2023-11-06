import { beforeEach, expect } from 'vitest';

import { map$, RefMapFn, RefMap } from '@/src/containers/map.js';
import { SyncMutableRef } from '@/src/defs/mutable-ref.js';
import { var$ } from '@/src/refs/var.js';

// Setup
let map: RefMap<string, number, SyncMutableRef<number>>;

beforeEach(() => {
  map = map$((key, value) => var$(value));
});

// Tests
describe('map$', () => {
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
});