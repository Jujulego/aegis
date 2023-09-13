import { Awaitable } from '@jujulego/utils';

import { AsyncMutable, MapMutateArg, MapReadValue, Mutable, MutateArg, ReadValue } from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
import { AsyncMutableRef, AsyncRef, MapRefValue, MutableRef, Ref, ref$, RefOpts } from '../refs/index.js';
import { awaitedCall } from '../utils/promise.js';

// Types
export type EachFn<DA, DB> = (arg: DA) => Awaitable<DB>;
export type SyncEachFn<DA, DB> = (arg: DA) => DB;
export type AsyncEachFn<DA, DB> = (arg: DA) => PromiseLike<DB>;

export interface EachRead<DA, DB> {
  read(arg: DA): Awaitable<DB>;
}
export interface SyncEachRead<DA, DB> {
  read(arg: DA): DB;
}
export interface AsyncEachRead<DA, DB> {
  read(arg: DA): PromiseLike<DB>;
}

export interface EachMutate<AA, AB> {
  mutate(arg: AB): Awaitable<AA>;
}
export interface SyncEachMutate<AA, AB> {
  mutate(arg: AB): AA;
}
export interface AsyncEachMutate<AA, AB> {
  mutate(arg: AB): PromiseLike<AA>;
}

export type EachOpts<DA, AA, DB, AB> = EachRead<DA, DB> & Partial<EachMutate<AA, AB>>;

// Utils
export function parseArg<DA, AA, DB, AB>(arg: EachFn<DA, DB> | EachOpts<DA, AA, DB, AB>): EachOpts<DA, AA, DB, AB> {
  return typeof arg === 'function' ? { read: arg } : arg;
}

// Operator
export function each$<A extends MutableRef, DB, AB>(opts: AsyncEachRead<ReadValue<A>, DB> & AsyncEachMutate<MutateArg<A>, AB>): PipeOperator<A, AsyncMutableRef<DB, AB>>;
export function each$<A extends MutableRef, DB, AB>(opts: AsyncEachRead<ReadValue<A>, DB> & SyncEachMutate<MutateArg<A>, AB>): PipeOperator<A, AsyncMutableRef<DB, AB>>;
export function each$<A extends MutableRef, DB, AB>(opts: AsyncEachRead<ReadValue<A>, DB> & EachMutate<MutateArg<A>, AB>): PipeOperator<A, AsyncMutableRef<DB, AB>>;

export function each$<A extends MutableRef, DB, AB>(opts: SyncEachRead<ReadValue<A>, DB> & AsyncEachMutate<MutateArg<A>, AB>): PipeOperator<A, MutableRef<DB, AB, MapReadValue<A, DB>, AsyncMutable<DB, AB>>>;
export function each$<A extends MutableRef, DB, AB>(opts: SyncEachRead<ReadValue<A>, DB> & SyncEachMutate<MutateArg<A>, AB>): PipeOperator<A, MutableRef<DB, AB, MapReadValue<A, DB>, MapMutateArg<A, DB, AB>>>;
export function each$<A extends MutableRef, DB, AB>(opts: SyncEachRead<ReadValue<A>, DB> & EachMutate<MutateArg<A>, AB>): PipeOperator<A, MutableRef<DB, AB, MapReadValue<A, DB>>>;

export function each$<A extends MutableRef, DB, AB>(opts: EachRead<ReadValue<A>, DB> & AsyncEachMutate<MutateArg<A>, AB>): PipeOperator<A, MutableRef<DB, AB>>;
export function each$<A extends MutableRef, DB, AB>(opts: EachRead<ReadValue<A>, DB> & SyncEachMutate<MutateArg<A>, AB>): PipeOperator<A, MutableRef<DB, AB>>;
export function each$<A extends MutableRef, DB, AB>(opts: EachRead<ReadValue<A>, DB> & EachMutate<MutateArg<A>, AB>): PipeOperator<A, MutableRef<DB, AB>>;

export function each$<A extends Ref, DB>(opts: AsyncEachRead<ReadValue<A>, DB>): PipeOperator<A, AsyncRef<DB>>;
export function each$<A extends Ref, DB>(opts: SyncEachRead<ReadValue<A>, DB>): PipeOperator<A, MapRefValue<A, DB>>;
export function each$<A extends Ref, DB>(opts: EachRead<ReadValue<A>, DB>): PipeOperator<A, Ref<DB>>;

export function each$<A extends Ref, DB>(fn: AsyncEachFn<ReadValue<A>, DB>): PipeOperator<A, AsyncRef<DB>>;
export function each$<A extends Ref, DB>(fn: SyncEachFn<ReadValue<A>, DB>): PipeOperator<A, MapRefValue<A, DB>>;
export function each$<A extends Ref, DB>(fn: EachFn<ReadValue<A>, DB>): PipeOperator<A, Ref<DB>>;

export function each$<A extends MutableRef, DB, AB>(opts: EachOpts<ReadValue<A>, MutateArg<A>, DB, AB>): PipeOperator<A, MutableRef<DB, AB>>;

export function each$<DA, AA, DB, AB>(arg: EachFn<DA, DB> | EachOpts<DA, AA, DB, AB>): PipeOperator<Ref<DA>, Ref<DB>> {
  const opts = parseArg<DA, AA, DB, AB>(arg);

  return (ref: Ref<DA>, { off }) => {
    const outOpts: RefOpts<DB, AB> = {
      read: () => awaitedCall<DA, DB>(opts.read, ref.read()),
    };

    if ('mutate' in opts && 'mutate' in ref) {
      Object.assign(outOpts, {
        mutate: (arg: AB) => awaitedCall(opts.read, awaitedCall((ref as Mutable<DA, AA>).mutate, opts.mutate!(arg)))
      });
    }

    const out = ref$<DB>(outOpts);

    off.add(
      ref.subscribe((data) => awaitedCall(out.next, opts.read(data)))
    );

    return out;
  };
}
