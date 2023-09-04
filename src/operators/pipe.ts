import { Awaitable } from '@jujulego/utils';

import { AsyncReadable, Readable, SyncReadable } from '../defs/index.js';
import { Ref, ref$ } from '../refs/index.js';
import { callWithAwaitable } from '../utils/promise.js';

// Types
export type PipeOp<I, O> = (input: I) => Awaitable<O>;
export type SyncPipeOp<I, O> = (input: I) => O;
export type AsyncPipeOp<I, O> = (input: I) => PromiseLike<O>;

export type PipeRef<D, R extends Readable<D> = Readable<D>> = Ref<D, R> & {
  off(): void;
}

export type SyncPipeRef<D> = PipeRef<D, SyncReadable<D>>;
export type AsyncPipeRef<D> = PipeRef<D, AsyncReadable<D>>;

// Operator
export function pipe$<A, B>(ref: Ref<A>, op: AsyncPipeOp<A, B>): AsyncPipeRef<B>;
export function pipe$<A, B>(ref: Ref<A>, op: SyncPipeOp<A, B>): SyncPipeRef<B>;
export function pipe$<A, B>(ref: Ref<A>, op: PipeOp<A, B>): PipeRef<B>;

export function pipe$(ref: Ref<unknown>, ...ops: PipeOp<unknown, unknown>[]): PipeRef<unknown> {
  function apply(arg: unknown) {
    return ops.reduce((arg, op) => callWithAwaitable(arg, op), arg);
  }

  const out = ref$(() => callWithAwaitable(ref.read(), apply));

  return Object.assign(out, {
    off: ref.subscribe((data) => callWithAwaitable(apply(data), out.next))
  });
}
