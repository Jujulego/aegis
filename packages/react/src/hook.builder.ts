import { Aegis, AegisItem, AegisList } from '@jujulego/aegis-core';
import { useCallback, useEffect, useMemo } from 'react';

import { useAegisItem, useAegisList, useDeepMemo } from './hooks';

// Types
export type AegisItemFetcher<A extends [{ id: string }, ...unknown[]] = [{ id: string }, ...unknown[]]> = (...args: A) => AegisItem<unknown>;

export type AegisItemKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends AegisItemFetcher ? K : never;
}[keyof E];

export type AegisItemParam<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends AegisItemFetcher<infer A> ? A : never;

export type AegisListFetcher<A extends unknown[] = unknown[]> = (key: string, ...args: A) => unknown;

export type AegisListKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends AegisListFetcher ? K : never;
}[keyof E];

export type AegisListParam<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends AegisListFetcher<infer A> ? A : never;

// Builder
export function $hook<T, E extends Aegis<T, unknown>>(entity: E) {
  return {
    item<N extends AegisItemKeys<E>>(name: N) {
      const query = entity[name] as unknown as (...args: AegisItemParam<E, N>) => AegisItem<T>;

      return function useItem(...args: AegisItemParam<E, N>) {
        const _args = useDeepMemo(args);
        const id = args[0].id;
        const item = useMemo(() => entity.$entity.item(id), [id]);

        const { isLoading, data } = useAegisItem(item);

        useEffect(() => {
          query(..._args);
        }, [_args]);

        return {
          item,
          isLoading, data,
          refresh: useCallback(() => query(..._args), [_args]),
        };
      };
    },
    list<N extends AegisListKeys<E>>(name: N, key: string) {
      const query = entity[name] as unknown as (key: string, ...args: AegisListParam<E, N>) => AegisList<T>;

      return function useList(...args: AegisListParam<E, N>) {
        const _args = useDeepMemo(args);
        const list = useMemo(() => entity.$entity.list(key), []);

        const { isLoading, data } = useAegisList(list);

        useEffect(() => {
          query(key, ..._args);
        }, [_args]);

        return {
          list,
          isLoading, data,
          refresh: useCallback(() => query(key, ..._args), [_args]),
        };
      };
    }
  };
}
