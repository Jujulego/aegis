import { mutable$, SyncMutableRef } from './mutable.js';

// Builder
export function var$<D>(): SyncMutableRef<D | undefined, D>;
export function var$<D>(initial: D): SyncMutableRef<D, D>;
export function var$<D>(initial?: D): SyncMutableRef<D | undefined, D>;

export function var$<D>(initial?: D): SyncMutableRef<D | undefined, D> {
  let data = initial;

  return mutable$({
    read: () => data,
    mutate: (val: D) => data = val,
  });
}
