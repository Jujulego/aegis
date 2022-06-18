import { Aegis, AegisItem, AegisList } from '@jujulego/aegis-core';
import { useCallback, useEffect, useMemo } from 'react';

import { useAegisItem, useAegisList } from './hooks';

// Types
export type AegisItemKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends (id: string) => AegisItem<unknown> ? K : never;
}[keyof E];

export type AegisItemId<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends (id: infer I extends string) => AegisItem<unknown> ? I : never

export type AegisListKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends (key: string, ...args: unknown[]) => AegisList<unknown> ? K : never;
}[keyof E];

export type AegisListParam<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends (key: string, ...args: infer A) => unknown ? A : never

// Builder
export function $hook<T, E extends Aegis<T, unknown>>(entity: E) {
  return {
    item<N extends AegisItemKeys<E>>(name: N) {
      const query = entity[name] as unknown as (id: string) => AegisItem<T>;

      return function useItem(id: AegisItemId<E, N>) {
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
    list<N extends AegisListKeys<E>>(name: N, key: string) {
      const query = entity[name] as unknown as (...args: unknown[]) => AegisList<T>;

      return function useList(...args: AegisListParam<E, N>) {
        const list = useMemo(() => entity.$entity.getList(key), []);

        const { isPending, data } = useAegisList(list);

        useEffect(() => {
          query(key, ...args);
        }, [key, ...args]);

        return {
          list,
          isPending, data,
          refresh: useCallback(() => query(key, ...args), [key, ...args]),
        };
      };
    }
  };
}
