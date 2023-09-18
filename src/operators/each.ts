import { EmitValue, source$, Source } from '@jujulego/event-tree';
import { Awaitable } from '@jujulego/utils';

import {
  AsyncMutable, AsyncMutableRef, AsyncRef,
  MapMutateArg,
  MapReadValue, MapRefValue,
  Mutable,
  MutableRef,
  MutateArg, Readable,
  ReadValue,
  Ref
} from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
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
function parseArg<DA, AA, DB, AB>(arg: EachFn<DA, DB> | EachOpts<DA, AA, DB, AB>): EachOpts<DA, AA, DB, AB> {
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

export function each$<A extends Source, DB>(opts: AsyncEachRead<EmitValue<A>, DB>): PipeOperator<A, A extends Readable ? AsyncRef<DB> : Source<DB>>;
export function each$<A extends Source, DB>(opts: SyncEachRead<EmitValue<A>, DB>): PipeOperator<A, A extends Readable ? MapRefValue<A, DB> : Source<DB>>;
export function each$<A extends Source, DB>(opts: EachRead<EmitValue<A>, DB>): PipeOperator<A, A extends Readable ? Ref<DB> : Source<DB>>;

export function each$<A extends Source, DB>(fn: AsyncEachFn<EmitValue<A>, DB>): PipeOperator<A, A extends Readable ? AsyncRef<DB> : Source<DB>>;
export function each$<A extends Source, DB>(fn: SyncEachFn<EmitValue<A>, DB>): PipeOperator<A, A extends Readable ? MapRefValue<A, DB> : Source<DB>>;
export function each$<A extends Source, DB>(fn: EachFn<EmitValue<A>, DB>): PipeOperator<A, A extends Readable ? Ref<DB> : Source<DB>>;

export function each$<A extends MutableRef, DB, AB>(opts: EachOpts<ReadValue<A>, MutateArg<A>, DB, AB>): PipeOperator<A, MutableRef<DB, AB>>;

export function each$<DA, AA, DB, AB>(arg: EachFn<DA, DB> | EachOpts<DA, AA, DB, AB>): PipeOperator<Source<DA>, Source<DB>> {
  const opts = parseArg<DA, AA, DB, AB>(arg);

  return (src: Source<DA>, { off }) => {
    const out = source$<DB>();

    if ('read' in src) {
      Object.assign(out, {
        read: () => awaitedCall<DA, DB>(opts.read, (src as Readable<DA>).read()),
      });

      if ('mutate' in opts && 'mutate' in src) {
        Object.assign(out, {
          mutate: (arg: AB) => awaitedCall(opts.read, awaitedCall((src as Mutable<DA, AA>).mutate, opts.mutate!(arg)))
        });
      }
    }

    off.add(
      src.subscribe((data) => awaitedCall(out.next, opts.read(data)))
    );

    return out;
  };
}
