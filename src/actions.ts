import { produce } from 'immer';

import { SyncMutableRef } from './defs/index.js';

// Types
export type ActionReducer<P extends unknown[], T> = (...params: P) => (old: T) => void | T;
export type Action<P extends unknown[], T> = (...params: P) => T;

export type ActionsRef<T, A extends Record<string, ActionReducer<unknown[], T>>> = {
  [K in keyof A]: A[K] extends ActionReducer<infer Args, T> ? Action<Args, T> : never;
} & SyncMutableRef<T>;

export function actions<T, A extends Record<string, ActionReducer<any[], T>>>(ref: SyncMutableRef<T>, actions: A): ActionsRef<T, A> {
  const result: SyncMutableRef<T> = {
    next: ref.next,
    read: ref.read,
    mutate: ref.mutate,
    subscribe: ref.subscribe,
    unsubscribe: ref.unsubscribe,
    clear: ref.clear,
  };

  for (const [key, act] of Object.entries(actions)) {
    Object.assign(result, {
      [key]: (...params: any[]) => ref.mutate(produce(ref.read(), act(...params))),
    });
  }

  return result as ActionsRef<T, A>;
}