import { MemoryStore, StorageStore } from '@jujulego/aegis-core';

import { $store } from '../src';

// Tests
describe('$store', () => {
  describe('$store.memory', () => {
    it('should return a MemoryStore', () => {
      expect($store.memory()).toBeInstanceOf(MemoryStore);
    });
  });

  describe('$store.localStorage', () => {
    it('should return a StorageStore using localStorage', () => {
      const store = $store.localStorage();

      expect(store).toBeInstanceOf(StorageStore);
      expect(store.storage).toBe(localStorage);
    });
  });

  describe('$store.sessionStorage', () => {
    it('should return a StorageStore using sessionStorage', () => {
      const store = $store.sessionStorage();

      expect(store).toBeInstanceOf(StorageStore);
      expect(store.storage).toBe(sessionStorage);
    });
  });
});
