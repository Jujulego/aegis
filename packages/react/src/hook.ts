import { AegisEntity, AegisId, AegisProtocol, AegisUnknownItem, Fetcher } from '@jujulego/aegis';
import { useMemo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// Types
export type AegisItemKeys<P extends AegisProtocol> = {
  [K in keyof P]: P[K] extends Fetcher<unknown[], AegisUnknownItem<unknown>> ? K : never;
}[keyof P];

// Builder
export function $hook<T, I extends AegisId, P extends AegisProtocol>(entity: AegisEntity<T, I, P>) {
  return {
    item<N extends AegisItemKeys<P>>(name: N) {
      return function useAegisItem(...args: Parameters<P[N]>): ReturnType<P[N]> {
        const item = useMemo(() => entity[name](...args) as AegisUnknownItem<T>, args);

        useSyncExternalStore((cb) => item.subscribe('query', cb), () => item.isLoading);
        useSyncExternalStore((cb) => item.subscribe('update', cb), () => item.data);

        return item as ReturnType<P[N]>;
      };
    }
  };
}
