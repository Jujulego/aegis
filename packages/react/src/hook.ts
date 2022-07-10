import {
  AegisEntity,
  AegisId,
  AegisList,
  AegisProtocol,
  AegisUnknownItem,
  AegisUnknownMutation,
  Fetcher
} from '@jujulego/aegis';
import { useCallback, useMemo } from 'react';

import { useAegisItem, useAegisList, useDeepMemo } from './hooks';

// Types
export type AegisItemKeys<T, P extends AegisProtocol> = {
  [K in keyof P]: P[K] extends Fetcher<any[], AegisUnknownItem<T>> ? K : never;
}[keyof P];

export type AegisListKeys<T, P extends AegisProtocol> = {
  [K in keyof P]: P[K] extends Fetcher<any[], AegisList<T>> ? K : never;
}[keyof P];

export type AegisMutationKeys<T, P extends AegisProtocol> = {
  [K in keyof P]: P[K] extends Fetcher<any[], AegisUnknownMutation<T, any>> ? K : never;
}[keyof P];

// Builder
export function $hook<T, I extends AegisId, P extends AegisProtocol>(entity: AegisEntity<T, I, P>) {
  return {
    item<N extends AegisItemKeys<T, P>>(name: N) {
      return function useItem(...args: Parameters<P[N]>): ReturnType<P[N]> {
        const _args = useDeepMemo(args);
        const item = useMemo(() => entity[name](..._args) as AegisUnknownItem<T, I>, [_args]);

        return useAegisItem(item) as ReturnType<P[N]>;
      };
    },
    list<N extends AegisListKeys<T, P>>(name: N) {
      return function useList(...args: Parameters<P[N]>): ReturnType<P[N]> {
        const _args = useDeepMemo(args);
        const list = useMemo(() => entity[name](..._args) as AegisList<T>, [_args]);

        return useAegisList(list) as ReturnType<P[N]>;
      };
    },
    mutation<N extends AegisMutationKeys<T, P>>(name: N) {
      return function useMutation() {
        return useCallback((...args: Parameters<P[N]>): ReturnType<P[N]> => {
          return entity[name](...args);
        }, []);
      };
    },
  };
}
