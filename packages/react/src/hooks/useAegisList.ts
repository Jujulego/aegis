import { AegisList } from '@jujulego/aegis-core';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Hooks
export function useAegisList<T>(list: AegisList<T>) {
  return useSyncExternalStore(
    (cb) => {
      list.addEventListener('update', cb);
      return () => list.removeEventListener('update', cb);
    },
    () => list
  );
}
