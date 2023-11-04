import { SyncMutableRef } from '../defs/index.js';
import { ref$ } from './ref.js';

/**
 * Reference on data stored in a browser's storage (either localStorage or sessionStorage).
 */
export function storage$<D>(storage: Storage, key: string): SyncMutableRef<D | null>;

/**
 * Reference on data stored in a browser's storage (either localStorage or sessionStorage).
 * Stores initial data only if nothing is found in storage.
 */
export function storage$<D>(storage: Storage, key: string, initial: D): SyncMutableRef<D>;

/**
 * Reference on data stored in a browser's storage (either localStorage or sessionStorage).
 * Stores initial data only if nothing is found in storage.
 */
export function storage$<D>(storage: Storage, key: string, initial?: D): SyncMutableRef<D | null>;

export function storage$<D>(storage: Storage, key: string, initial?: D): SyncMutableRef<D | null> {
  // Set initial data
  if (storage.getItem(key) === null && initial !== undefined && initial !== null) {
    storage.setItem(key, JSON.stringify(initial));
  }

  // Utils
  function read(): D | null {
    // Extract json
    const json = storage.getItem(key);

    if (json === null) {
      return null;
    }

    // Parse stored json
    return JSON.parse(json) as D | null;
  }

  // Build reference
  const ref = ref$({
    read,
    mutate(arg: D | null): D | null {
      if (arg === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(arg));
      }

      return arg;
    }
  });

  // Watch for changes
  window.addEventListener('storage', (event) => {
    if (event.storageArea === storage && event.key === key) {
      ref.next(event.newValue === null ? null : JSON.parse(event.newValue));
    }
  });

  return ref;
}
