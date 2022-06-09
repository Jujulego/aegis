import { AegisItem } from '@jujulego/aegis-core';
import { useSyncExternalStore } from 'react';

// Hooks
export function useAegisItem<T>(item: AegisItem<T>) {
  return useSyncExternalStore(
    (cb) => {
      item.addEventListener('update', cb);
      return () => item.removeEventListener('update', cb);
    },
    () => item.data
  );
}
