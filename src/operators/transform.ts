import { AsyncMutable, AsyncReadable, MutateArg, ReadValue, SyncMutable, SyncReadable } from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
import { mutable$, MutableRef } from '../refs/index.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export interface TransformReadAsync<M extends MutableRef, D> {
  read(val: ReadValue<M>): PromiseLike<D>;
}

export interface TransformReadSync<M extends MutableRef, D> {
  read(val: ReadValue<M>): D;
}

export interface TransformMutateAsync<M extends MutableRef, D, A = D> {
  mutate(arg: A): PromiseLike<MutateArg<M>>;
}

export interface TransformMutateSync<M extends MutableRef, D, A = D> {
  mutate(arg: A): MutateArg<M>;
}

// Operator
export function transform$<M extends MutableRef, D, A>(opts: TransformReadAsync<M, D> & TransformMutateAsync<M, D, A>): PipeOperator<M, MutableRef<D, A, AsyncReadable<D>, AsyncMutable<D, A>>>;
export function transform$<M extends MutableRef, D, A>(opts: TransformReadAsync<M, D> & TransformMutateSync<M, D, A>): PipeOperator<M, MutableRef<D, A, AsyncReadable<D>, SyncMutable<D, A>>>;
export function transform$<M extends MutableRef, D, A>(opts: TransformReadSync<M, D> & TransformMutateAsync<M, D, A>): PipeOperator<M, MutableRef<D, A, SyncReadable<D>, AsyncMutable<D, A>>>;
export function transform$<M extends MutableRef, D, A>(opts: TransformReadSync<M, D> & TransformMutateSync<M, D, A>): PipeOperator<M, MutableRef<D, A, SyncReadable<D>, SyncMutable<D, A>>>;

export function transform$<DA, AA, DB, AB>(opts: { read(val: DA): DB, mutate(arg: AB): AA }): PipeOperator<MutableRef<DA, AA>, MutableRef<DB, AB>> {
  return (ref: MutableRef<DA, AA>, { off }) => {
    const out = mutable$<DB, AB>({
      read: () => awaitedCall<DA, DB>(ref.read(), opts.read),
      mutate: (arg: AB) => awaitedCall(awaitedCall(opts.mutate(arg), ref.mutate), opts.read)
    });
    off.add(ref.subscribe((data) => awaitedCall(opts.read(data), out.next)));

    return out;
  };
}
