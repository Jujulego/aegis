import { AegisUnknownItem } from '@jujulego/aegis';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Hooks
export function useAegisItem<I extends AegisUnknownItem<any>>(item: I): I {
  // Register for updates
  useSyncExternalStore((cb) => item.subscribe('query', cb), () => item.isLoading);
  useSyncExternalStore((cb) => item.subscribe('update', cb), () => item.data);

  return item;
}
