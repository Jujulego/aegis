import { produce } from 'immer';

import { AsyncMutable, AsyncReadable, MutableRef } from './defs/index.js';
import { awaitedCall } from './utils/promise.js';

// Types
export type ActionReducer<P extends unknown[], D> = (...params: P) => (old: D) => void | D;
export type ActionReducers<D> = Record<string, ActionReducer<any[], D>>;

export type Action<P extends unknown[], D, R extends MutableRef<D>> = (...params: P) => ActionResult<D, R>;
export type ActionResult<D, R extends MutableRef<D>> = R extends AsyncReadable<D> | AsyncMutable<D> ? Promise<D> : D;

export type ActionsRef<D, R extends MutableRef<D>, A extends Record<string, ActionReducer<unknown[], D>>> = R & {
  [K in keyof A]: A[K] extends ActionReducer<infer P, D> ? Action<P, D, R> : never;
};

export function actions<D, R extends MutableRef<D>, A extends ActionReducers<D>>(ref: R, actions: A): ActionsRef<D, R, A> {
  for (const [key, act] of Object.entries(actions)) {
    Object.assign(ref, {
      [key]: (...params: any[]) => awaitedCall(
        (result: D) => ref.mutate(result),
        awaitedCall(
          (old: D) => produce(old, act(...params)),
          ref.read()
        )
      ),
    });
  }

  return ref as ActionsRef<D, R, A>;
}