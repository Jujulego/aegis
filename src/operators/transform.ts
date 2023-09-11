import {
  AsyncMutable,
  AsyncReadable,
  MapMutateArg, MapReadValue,
  MutateArg,
  ReadValue,
} from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
import { MutableRef, ref$ } from '../refs/index.js';
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
export function transform$<M extends MutableRef, D, A>(opts: TransformReadAsync<M, D> & TransformMutateSync<M, D, A>): PipeOperator<M, MutableRef<D, A, AsyncReadable<D>, AsyncMutable<D, A>>>;
export function transform$<M extends MutableRef, D, A>(opts: TransformReadSync<M, D> & TransformMutateAsync<M, D, A>): PipeOperator<M, MutableRef<D, A, MapReadValue<M, D>, AsyncMutable<D, A>>>;
export function transform$<M extends MutableRef, D, A>(opts: TransformReadSync<M, D> & TransformMutateSync<M, D, A>): PipeOperator<M, MutableRef<D, A, MapReadValue<M, D>, MapMutateArg<M, D, A>>>;

export function transform$<DA, AA, DB, AB>(opts: { read(val: DA): DB, mutate(arg: AB): AA }): PipeOperator<MutableRef<DA, AA>, MutableRef<DB, AB>> {
  return (ref: MutableRef<DA, AA>, { off }) => {
    const out = ref$<DB, AB>({
      read: () => awaitedCall<DA, DB>(opts.read, ref.read()),
      mutate: (arg: AB) => awaitedCall(opts.read, awaitedCall(ref.mutate, opts.mutate(arg)))
    });
    off.add(ref.subscribe((data) => awaitedCall(out.next, opts.read(data))));

    return out;
  };
}
