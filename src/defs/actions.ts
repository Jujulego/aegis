import { ObservedValue } from '@jujulego/event-tree';
import { Draft } from 'immer';

import { AsyncMutable } from './mutable.js';
import { SymmetricRef } from './mutable-ref.js';
import { AsyncReadable } from './readable.js';

/**
 * Function returning a reducer modifying the current value of a reference
 */
export type ActionReducer<P extends unknown[], D> = (...params: P) => (old: Draft<D>) => Draft<D> | void;

/**
 * Record of {@link ActionReducer}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionReducers<D = unknown> = Record<string, ActionReducer<any[], D>>;

/**
 * Result of an {@link Action}. If the reference is fully synchronous the action will return the final value stored in
 * the reference, which was returned by its mutate method.
 * If either read or mutate (or both) is asynchronous then the action will also be asynchronous.
 */
export type ActionResult<R extends SymmetricRef, D> = R extends AsyncReadable | AsyncMutable ? Promise<D> : D;

/**
 * Final method added to an {@link ActionRef}
 */
export type Action<P extends unknown[], R extends SymmetricRef> = (...params: P) => ActionResult<R, ObservedValue<R>>;

/**
 * Add actions from an {@link ActionReducers} to the given ref type.
 */
export type ActionRef<R extends SymmetricRef, A extends Record<string, ActionReducer<unknown[], ObservedValue<R>>>> = R & {
  [K in keyof A]: A[K] extends ActionReducer<infer P, ObservedValue<R>> ? Action<P, R> : never;
};
