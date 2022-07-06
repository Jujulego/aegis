import { Item } from '@jujulego/aegis';
import { useDebugValue } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Types
export interface ItemState<T> {
  isLoading: boolean;
  data?: T;
}

// Hooks
export function useAegisItem<T>(item: Item<T>): ItemState<T> {
  const isLoading = useSyncExternalStore((cb) => item.subscribe('query', cb), () => item.isLoading);
  const data = useSyncExternalStore((cb) => item.subscribe('update', cb), () => item.data);

  useDebugValue(data);

  return {
    isLoading,
    data,
  };
}
