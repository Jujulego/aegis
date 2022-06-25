import { AegisList, QueryStatus } from '@jujulego/aegis-core';
import { useDebugValue } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Types
export interface AegisListState<T> {
  status: QueryStatus;
  data: T[];
}

// Hooks
export function useAegisList<T>(list: AegisList<T>): AegisListState<T> {
  const status = useSyncExternalStore((cb) => list.subscribe('query', cb), () => list.status);
  const data = useSyncExternalStore((cb) => list.subscribe('update', cb), () => list.data);

  useDebugValue(data);

  return {
    status,
    data
  };
}
