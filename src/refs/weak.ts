import { SyncMutableRef } from '../defs/index.js';
import { ref$ } from './ref.js';

// Builder
export function weak$<D extends object>(initial?: D): SyncMutableRef<D | undefined, D> {
  let ref = initial && new WeakRef<D>(initial);

  return ref$({
    read: () => ref?.deref(),
    mutate(val: D) {
      ref = new WeakRef<D>(val);
      return val;
    },
  });
}
