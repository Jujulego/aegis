import { AegisList } from '@jujulego/aegis';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Hooks
export function useAegisList<L extends AegisList<any>>(list: L): L {
  // Register for updates
  useSyncExternalStore((cb) => list.subscribe('query', cb), () => list.isLoading);
  useSyncExternalStore((cb) => list.subscribe('update', cb), () => list.data);

  return list;
}
