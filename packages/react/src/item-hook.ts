import { Aegis, AegisItem } from '@jujulego/aegis-core';
import { useCallback, useEffect, useMemo } from 'react';

import { useAegisItem } from './hooks';

// Builder
export function $itemHook<N extends string, I extends string, T, E extends Aegis<T, Record<N, (id: I) => AegisItem<T>>>>(entity: E, name: N) {
  return function useItemHook(id: I) {
    const item = useMemo(() => entity.$entity.getItem(id), [id]);

    const { isPending, data } = useAegisItem(item);

    useEffect(() => {
      entity[name](id);
    }, [id]);

    return {
      item,
      isPending, data,
      refresh: useCallback(() => entity[name](id), [id]),
    };
  };
}
