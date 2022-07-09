import { AegisEntity, AegisId, AegisList, AegisProtocol, AegisUnknownItem, Fetcher } from '@jujulego/aegis';
import { useMemo } from 'react';

import { useAegisItem, useAegisList, useDeepMemo } from './hooks';

// Types
export type AegisItemKeys<P extends AegisProtocol> = {
  [K in keyof P]: P[K] extends Fetcher<unknown[], AegisUnknownItem<unknown>> ? K : never;
}[keyof P];

export type AegisListKeys<P extends AegisProtocol> = {
  [K in keyof P]: P[K] extends Fetcher<unknown[], AegisList<unknown>> ? K : never;
}[keyof P];

// Builder
export function $hook<T, I extends AegisId, P extends AegisProtocol>(entity: AegisEntity<T, I, P>) {
  return {
    item<N extends AegisItemKeys<P>>(name: N) {
      return function useItem(...args: Parameters<P[N]>): ReturnType<P[N]> {
        const _args = useDeepMemo(args);
        const item = useMemo(() => entity[name](..._args) as AegisUnknownItem<T>, [_args]);

        return useAegisItem(item) as ReturnType<P[N]>;
      };
    },
    list<N extends AegisListKeys<P>>(name: N) {
      return function useItem(...args: Parameters<P[N]>): ReturnType<P[N]> {
        const _args = useDeepMemo(args);
        const list = useMemo(() => entity[name](..._args) as AegisList<T>, [_args]);

        return useAegisList(list) as ReturnType<P[N]>;
      };
    },
  };
}
