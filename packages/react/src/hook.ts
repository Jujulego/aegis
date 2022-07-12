import { AegisList, AegisUnknownItem, Fetcher } from '@jujulego/aegis';
import { useMemo } from 'react';

import { useAegisItem, useAegisList, useDeepMemo } from './hooks';

// Builders
export const $hook = {
  item<A extends unknown[], I extends AegisUnknownItem<any>>(fetcher: Fetcher<A, I>) {
    return function useItem(...args: A): I {
      const _args = useDeepMemo(args);
      const item = useMemo(() => fetcher(..._args), [_args]);

      return useAegisItem<I>(item);
    };
  },
  list<A extends unknown[], L extends AegisList<any>>(fetcher: Fetcher<A, L>) {
    return function useList(...args: A): L {
      const _args = useDeepMemo(args);
      const list = useMemo(() => fetcher(..._args), [_args]);

      return useAegisList<L>(list);
    };
  }
};
