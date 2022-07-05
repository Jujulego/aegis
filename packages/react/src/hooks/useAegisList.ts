import { AegisList } from '@jujulego/aegis';
import { useDebugValue } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Types
export interface AegisListState<T> {
  isLoading: boolean;
  data: T[];
}

// Hooks
export function useAegisList<T>(list: AegisList<T>): AegisListState<T> {
  const isLoading = useSyncExternalStore((cb) => list.subscribe('query', cb), () => list.isLoading);
  const data = useSyncExternalStore((cb) => list.subscribe('update', cb), () => list.data);

  useDebugValue(data);

  return {
    isLoading,
    data
  };
}
