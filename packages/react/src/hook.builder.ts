import { Aegis, Item, List } from '@jujulego/aegis';
import { useCallback, useEffect, useMemo } from 'react';

import { useAegisItem, useAegisList, useDeepMemo } from './hooks';

// Types
export type ItemFetcher<A extends [{ id: string }, ...unknown[]] = [{ id: string }, ...unknown[]]> = (...args: A) => Item<unknown>;

export type ItemKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends ItemFetcher ? K : never;
}[keyof E];

export type ItemParam<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends ItemFetcher<infer A> ? A : never;

export type ListFetcher<A extends unknown[] = unknown[]> = (key: string, ...args: A) => unknown;

export type ListKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends ListFetcher ? K : never;
}[keyof E];

export type ListParam<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends ListFetcher<infer A> ? A : never;

// Builder
export function $hook<T, E extends Aegis<T, unknown>>(entity: E) {
  return {
    item<N extends ItemKeys<E>>(name: N) {
      const query = entity[name] as unknown as (...args: ItemParam<E, N>) => Item<T>;

      return function useItem(...args: ItemParam<E, N>) {
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
    list<N extends ListKeys<E>>(name: N, key: string) {
      const query = entity[name] as unknown as (key: string, ...args: ListParam<E, N>) => List<T>;

      return function useList(...args: ListParam<E, N>) {
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
