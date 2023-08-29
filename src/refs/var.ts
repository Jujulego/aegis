import { mutable$, SyncMutableRef } from './mutable.js';

// Builder
export function var$<T>(): SyncMutableRef<T | undefined, T>;
export function var$<T>(initial: T): SyncMutableRef<T, T>;
export function var$<T>(initial?: T): SyncMutableRef<T | undefined, T>;

export function var$<T>(initial?: T): SyncMutableRef<T | undefined, T> {
  let data = initial;

  return mutable$({
    read: () => data,
    mutate: (val: T) => data = val,
  });
}
