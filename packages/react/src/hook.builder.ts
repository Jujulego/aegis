import { Aegis, AegisItem, AegisList } from '@jujulego/aegis-core';
import { useCallback, useEffect, useMemo } from 'react';

import { useAegisItem, useAegisList } from './hooks';

// Types
export type AegisItemQueries<T, E extends Aegis<T, unknown>> = {
  [K in keyof E]: E[K] extends (id: infer I extends string) => AegisItem<T> ? (id: I) => AegisItem<T> : never;
};

export type AegisListQueries<T, E extends Aegis<T, unknown>> = {
  [K in keyof E]: E[K] extends (key: string, ...args: infer A) => AegisList<T> ? (...args: A) => AegisList<T> : never;
};

// Builder
export function $hook<T, E extends Aegis<T, unknown>>(entity: E) {
  return {
    item<N extends keyof AegisItemQueries<T, E>>(name: N) {
      const query = (entity as unknown as AegisItemQueries<T, E>)[name];

      return function useItem(id: Parameters<AegisItemQueries<T, E>[N]>[0]) {
        const item = useMemo(() => entity.$entity.getItem(id), [id]);

        const { isPending, data } = useAegisItem(item);

        useEffect(() => {
          query(id);
        }, [id]);

        return {
          item,
          isPending, data,
          refresh: useCallback(() => query(id), [id]),
        };
      };
    },
    list<N extends keyof AegisListQueries<T, E>>(name: N, key: string) {
      const query = (entity as unknown as AegisListQueries<T, E>)[name];

      return function useList(...args: Parameters<AegisListQueries<T, E>[N]>) {
        const list = useMemo(() => entity.$entity.getList(key), []);

        const { isPending, data } = useAegisList(list);

        useEffect(() => {
          query(...args);
        }, args);

        return {
          list,
          isPending, data,
          refresh: useCallback(() => query(...args), args),
        };
      };
    }
  };
}
