import { produce } from 'immer';

import { AsyncMutable, AsyncReadable, MutableRef } from './defs/index.js';
import { awaitedCall } from './utils/promise.js';
import { ObservedValue } from '@jujulego/event-tree';

// Types
export type SymmetricRef<D = unknown> = MutableRef<D, D>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionReducers<D = unknown> = Record<string, ActionReducer<any[], D>>;
export type ActionReducer<P extends unknown[], D> = (...params: P) => (old: D) => void | D;

export type Action<P extends unknown[], R extends SymmetricRef> = (...params: P) => ActionResult<R, ObservedValue<R>>;
export type ActionResult<R extends SymmetricRef, D> = R extends AsyncReadable | AsyncMutable ? Promise<D> : D;

export type ActionsRef<R extends SymmetricRef, A extends Record<string, ActionReducer<unknown[], ObservedValue<R>>>> = R & {
  [K in keyof A]: A[K] extends ActionReducer<infer P, ObservedValue<R>> ? Action<P, R> : never;
};

export function actions$<R extends SymmetricRef, A extends ActionReducers<ObservedValue<R>>>(ref: R, actions: A): ActionsRef<R, A> {
  for (const [key, act] of Object.entries(actions)) {
    Object.assign(ref, {
      [key]: (...params: unknown[]) => awaitedCall(
        (result) => ref.mutate(result),
        awaitedCall(
          (old) => produce(old, act(...params)),
          ref.read()
        )
      ),
    });
  }

  return ref as ActionsRef<R, A>;
}