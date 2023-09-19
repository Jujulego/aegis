import { source$, Observable as Obs, Source, ObservedValue } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import {
  AsyncMutableRef, AsyncRef,
  MapMutateArg,
  MapReadValue, MapRefValue,
  Mutable,
  MutableRef,
  Readable,
  Ref
} from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export type EachFn<DA, DB> = (arg: DA) => Awaitable<DB>;
export type SyncEachFn<DA, DB> = (arg: DA) => DB;
export type AsyncEachFn<DA, DB> = (arg: DA) => PromiseLike<DB>;

/** Builds an async source type, with same features than A, but a different data type DB */
export type EachAsyncSource<A extends Obs, DB> = A extends Ref
  ? A extends Mutable<infer AA>
    ? AsyncMutableRef<DB, AA>
    : AsyncRef<DB>
  : Source<DB>;

/** Builds a source type, with same features and synchronicity than A, but a different data type DB */
export type EachSyncSource<A extends Obs, DB> = A extends Ref
  ? A extends Mutable<infer AA>
    ? MutableRef<DB, AA, MapReadValue<A, DB>, MapMutateArg<A, DB, AA>>
    : MapRefValue<A, DB>
  : Source<DB>;

/** Builds an awaitable source type, with same features than A, but a different data type DB */
export type EachSource<A extends Obs, DB> = A extends Ref
  ? A extends Mutable<infer AA>
    ? MutableRef<DB, AA>
    : Ref<DB>
  : Source<DB>;

// Operator
/**
 * Applies fn to each emitted value, read result and mutate result.
 * As fn is asynchronous, read and mutate in the final reference will too be asynchronous.
 *
 * WARNING: Order is not guaranteed, results will be emitted as they are resolved not as input comes.
 *
 * @param fn
 */
export function each$<A extends Obs, DB>(fn: AsyncEachFn<ObservedValue<A>, DB>): PipeOperator<A, EachAsyncSource<A, DB>>;

/**
 * Applies fn to each emitted value, read result and mutate result.
 * As fn is synchronous, read and mutate in the final reference will have the same synchronicity as the base ref.
 *
 * @param fn
 */
export function each$<A extends Obs, DB>(fn: SyncEachFn<ObservedValue<A>, DB>): PipeOperator<A, EachSyncSource<A, DB>>;

/**
 * Applies fn to each emitted value, read result and mutate result.
 *
 * @param fn
 */
export function each$<A extends Obs, DB>(fn: EachFn<ObservedValue<A>, DB>): PipeOperator<A, EachSource<A, DB>>;

export function each$<DA, AA, DB>(fn: EachFn<DA, DB>): PipeOperator<Obs<DA>, Obs<DB>> {
  return (obs: Obs<DA>, { off }) => {
    const out = source$<DB>();

    if ('read' in obs) {
      Object.assign(out, {
        read: () => awaitedCall<DA, DB>(fn, (obs as Readable<DA>).read()),
      });

      if ('mutate' in obs) {
        Object.assign(out, {
          mutate: (arg: AA) => awaitedCall(fn, awaitedCall((obs as Mutable<DA, AA>).mutate, arg))
        });
      }
    }

    off.add(
      obs.subscribe((data) => awaitedCall(out.next, fn(data)))
    );

    return out;
  };
}
