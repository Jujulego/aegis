import { MemoryStore, StorageStore } from '@jujulego/aegis-core';

// Store builders
export const $store = {
  /**
   * Returns a memory store
   */
  memory() {
    return new MemoryStore();
  },

  /**
   * Returns a storage store using localStorage
   */
  localStorage() {
    return new StorageStore(localStorage);
  },

  /**
   * Returns a storage store using sessionStorage
   */
  sessionStorage() {
    return new StorageStore(sessionStorage);
  }
};
