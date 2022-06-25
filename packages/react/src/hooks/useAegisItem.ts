import { AegisItem, QueryStatus } from '@jujulego/aegis-core';
import { useDebugValue } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Types
export interface AegisItemState<T> {
  status: QueryStatus;
  data?: T;
}

// Hooks
export function useAegisItem<T>(item: AegisItem<T>): AegisItemState<T> {
  const status = useSyncExternalStore((cb) => item.subscribe('query', cb), () => item.status);
  const data = useSyncExternalStore((cb) => item.subscribe('update', cb), () => item.data);

  useDebugValue(data);

  return {
    status,
    data,
  };
}
