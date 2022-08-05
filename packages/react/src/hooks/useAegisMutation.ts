import { AegisUnknownMutation } from '@jujulego/aegis';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Hooks
export function useAegisMutation<M extends AegisUnknownMutation<any>>(mutation: M): M {
  // Register for updates
  useSyncExternalStore((cb) => mutation.subscribe('status', cb), () => mutation.result);

  return mutation;
}
