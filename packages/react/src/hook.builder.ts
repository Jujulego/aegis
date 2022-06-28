import { Aegis, AegisItem, AegisList } from '@jujulego/aegis-core';
import { useCallback, useEffect, useMemo } from 'react';

import { useAegisItem, useAegisList } from './hooks';

// Types
export type AegisItemKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends (id: string) => AegisItem<unknown> ? K : never;
}[keyof E];

export type AegisItemParam<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends (...args: infer A extends [{ id: string }, ...unknown[]]) => AegisItem<unknown> ? A : never

export type AegisListKeys<E extends Aegis<unknown, unknown>> = {
  [K in keyof E]: E[K] extends (key: string, ...args: unknown[]) => AegisList<unknown> ? K : never;
}[keyof E];

export type AegisListParam<E extends Aegis<unknown, unknown>, N extends keyof E> =
  E[N] extends (key: string, ...args: infer A) => unknown ? A : never

// Builder
export function $hook<T, E extends Aegis<T, unknown>>(entity: E) {
  return {
    item<N extends AegisItemKeys<E>>(name: N) {
      const query = entity[name] as unknown as (...args: unknown[]) => AegisItem<T>;

      return function useItem(...args: AegisItemParam<E, N>) {
        const id = args[0].id;
        const item = useMemo(() => entity.$entity.item(id), [id]);

        const { status, data } = useAegisItem(item);

        useEffect(() => {
          query(...args);
        }, args);

        return {
          item,
          status, data,
          refresh: useCallback(() => query(id), [id]),
        };
      };
    },
    list<N extends AegisListKeys<E>>(name: N, key: string) {
      const query = entity[name] as unknown as (...args: unknown[]) => AegisList<T>;

      return function useList(...args: AegisListParam<E, N>) {
        const list = useMemo(() => entity.$entity.list(key), []);

        const { status, data } = useAegisList(list);

        useEffect(() => {
          query(key, ...args);
        }, [key, ...args]);

        return {
          list,
          status, data,
          refresh: useCallback(() => query(key, ...args), [key, ...args]),
        };
      };
    }
  };
}
