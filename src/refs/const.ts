import { ref$ } from './ref.js';
import { SyncRef } from '../defs/index.js';

// Builder
export function const$<const D>(value: D): SyncRef<D> {
  return ref$(() => value);
}
