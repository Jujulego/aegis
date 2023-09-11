import { ref$ } from './ref.js';
import { SyncMutableRef } from './types.js';

// Builder
export function var$<D>(): SyncMutableRef<D | undefined, D>;
export function var$<D>(initial: D): SyncMutableRef<D, D>;
export function var$<D>(initial?: D): SyncMutableRef<D | undefined, D>;

export function var$<D>(initial?: D): SyncMutableRef<D | undefined, D> {
  let data = initial;

  return ref$({
    read: () => data,
    mutate: (val: D) => data = val,
  });
}
