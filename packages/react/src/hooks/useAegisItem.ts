import { AegisItem } from '@jujulego/aegis-core';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { eventSubscriber } from '../utils';

// Types
export interface AegisItemState<T> {
  isPending: boolean;
  data?: T;
}

// Hooks
export function useAegisItem<T>(item: AegisItem<T>): AegisItemState<T> {
  const isPending = useSyncExternalStore(eventSubscriber(item, 'update'), () => item.isPending);
  const data = useSyncExternalStore(eventSubscriber(item, 'update'), () => item.data);

  return {
    isPending,
    data,
  };
}
