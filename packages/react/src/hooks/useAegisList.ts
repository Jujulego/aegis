import { AegisList } from '@jujulego/aegis-core';
import { useDebugValue } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { eventSubscriber } from '../utils';

// Types
export interface AegisListState<T> {
  isPending: boolean;
  data: T[];
}

// Hooks
export function useAegisList<T>(list: AegisList<T>): AegisListState<T> {
  const isPending = useSyncExternalStore(eventSubscriber(list, 'update'), () => list.isPending);
  const data = useSyncExternalStore(eventSubscriber(list, 'update'), () => list.data);

  useDebugValue(data);

  return {
    isPending,
    data
  };
}
