import { ref$, SyncRef } from './ref.js';

// Builder
export function const$<D>(value: D): SyncRef<D> {
  return ref$(() => value);
}
