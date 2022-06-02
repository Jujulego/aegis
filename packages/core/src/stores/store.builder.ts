import { AegisMemoryStore } from './memory.store';
import { AegisStorageStore } from './storage.store';

// Store builders
export const $store = {
  /**
   * Returns a memory store
   */
  memory() {
    return new AegisMemoryStore();
  },

  /**
   * Returns a storage store using localStorage
   */
  localStorage() {
    return new AegisStorageStore(localStorage);
  },

  /**
   * Returns a storage store using sessionStorage
   */
  sessionStorage() {
    return new AegisStorageStore(sessionStorage);
  }
};
