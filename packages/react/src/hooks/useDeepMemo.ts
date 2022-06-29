import { dequal } from 'dequal/lite';
import { useDebugValue, useRef } from 'react';

/**
 * Use dequal to test if the parameter equals the previous one.
 * If it is, returns the previous reference of to this object.
 *
 * @param obj
 */
export function useDeepMemo<T>(obj: T): T {
  const ref = useRef<T>(obj);

  if (!dequal(ref.current, obj)) {
    ref.current = obj;
  }

  useDebugValue(ref.current);

  return ref.current;
}
