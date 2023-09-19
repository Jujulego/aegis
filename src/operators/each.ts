import { EmitValue, source$, Source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import {
  AsyncMutableRef, AsyncRef,
  MapMutateArg,
  MapReadValue, MapRefValue,
  Mutable,
  MutableRef,
  MutateArg, Readable,
  Ref
} from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export type EachFn<DA, DB> = (arg: DA) => Awaitable<DB>;
export type SyncEachFn<DA, DB> = (arg: DA) => DB;
export type AsyncEachFn<DA, DB> = (arg: DA) => PromiseLike<DB>;

/** Builds an async source type, with same features than A, but a different data type DB */
export type EachAsyncSource<A extends Source, DB> = A extends Readable
  ? A extends Mutable
    ? AsyncMutableRef<DB, MutateArg<A>>
    : AsyncRef<DB>
  : Source<DB>;

/** Builds a source type, with same features and synchronicity than A, but a different data type DB */
export type EachSyncSource<A extends Source, DB> = A extends Readable
  ? A extends Mutable
    ? MutableRef<DB, MutateArg<A>, MapReadValue<A, DB>, MapMutateArg<A, DB, MutateArg<A>>>
    : MapRefValue<A, DB>
  : Source<DB>;

/** Builds an awaitable source type, with same features than A, but a different data type DB */
export type EachSource<A extends Source, DB> = A extends Readable
  ? A extends Mutable
    ? MutableRef<DB, MutateArg<A>>
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
export function each$<A extends Source, DB>(fn: AsyncEachFn<EmitValue<A>, DB>): PipeOperator<A, EachAsyncSource<A, DB>>;

/**
 * Applies fn to each emitted value, read result and mutate result.
 * As fn is synchronous, read and mutate in the final reference will have the same synchronicity as the base ref.
 *
 * @param fn
 */
export function each$<A extends Source, DB>(fn: SyncEachFn<EmitValue<A>, DB>): PipeOperator<A, EachSyncSource<A, DB>>;

/**
 * Applies fn to each emitted value, read result and mutate result.
 *
 * @param fn
 */
export function each$<A extends Source, DB>(fn: EachFn<EmitValue<A>, DB>): PipeOperator<A, EachSource<A, DB>>;

export function each$<DA, AA, DB>(fn: EachFn<DA, DB>): PipeOperator<Source<DA>, Source<DB>> {
  return (src: Source<DA>, { off }) => {
    const out = source$<DB>();

    if ('read' in src) {
      Object.assign(out, {
        read: () => awaitedCall<DA, DB>(fn, (src as Readable<DA>).read()),
      });

      if ('mutate' in src) {
        Object.assign(out, {
          mutate: (arg: AA) => awaitedCall(fn, awaitedCall((src as Mutable<DA, AA>).mutate, arg))
        });
      }
    }

    off.add(
      src.subscribe((data) => awaitedCall(out.next, fn(data)))
    );

    return out;
  };
}
