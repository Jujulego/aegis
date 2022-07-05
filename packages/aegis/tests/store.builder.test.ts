import { AegisMemoryStore, AegisStorageStore } from '@jujulego/aegis-core';

import { $store } from '../src';

// Tests
describe('$store', () => {
  describe('$store.memory', () => {
    it('should return a AegisMemoryStore', () => {
      expect($store.memory()).toBeInstanceOf(AegisMemoryStore);
    });
  });

  describe('$store.localStorage', () => {
    it('should return a AegisStorageStore using localStorage', () => {
      const store = $store.localStorage();

      expect(store).toBeInstanceOf(AegisStorageStore);
      expect(store.storage).toBe(localStorage);
    });
  });

  describe('$store.sessionStorage', () => {
    it('should return a AegisStorageStore using sessionStorage', () => {
      const store = $store.sessionStorage();

      expect(store).toBeInstanceOf(AegisStorageStore);
      expect(store.storage).toBe(sessionStorage);
    });
  });
});
