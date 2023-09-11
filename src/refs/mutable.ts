import { AsyncMutable, AsyncReadable, Mutable, Readable, SyncMutable, SyncReadable } from '../defs/index.js';
import { awaitedCall } from '../utils/promise.js';
import { Ref, ref$ } from './ref.js';

// Types
export type MutableRef<D = unknown, A = D, R extends Readable<D> = Readable<D>, M extends Mutable<D, A> = Mutable<D, A>> = Ref<D, R> & M;
export type SyncMutableRef<D = unknown, A = D> = MutableRef<D, A, SyncReadable<D>, SyncMutable<D, A>>;
export type AsyncMutableRef<D = unknown, A = D> = MutableRef<D, A, AsyncReadable<D>, AsyncMutable<D, A>>;

// Builder
export function mutable$<D, A = D>(opts: AsyncReadable<D> & AsyncMutable<D, A>): AsyncMutableRef<D, A>;
export function mutable$<D, A = D>(opts: AsyncReadable<D> & SyncMutable<D, A>): MutableRef<D, A, AsyncReadable<D>, SyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: AsyncReadable<D> & Mutable<D, A>): MutableRef<D, A, AsyncReadable<D>, Mutable<D, A>>;

export function mutable$<D, A = D>(opts: SyncReadable<D> & AsyncMutable<D, A>): MutableRef<D, A, SyncReadable<D>, AsyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: SyncReadable<D> & SyncMutable<D, A>): SyncMutableRef<D, A>;
export function mutable$<D, A = D>(opts: SyncReadable<D> & Mutable<D, A>): MutableRef<D, A, SyncReadable<D>, Mutable<D, A>>;

export function mutable$<D, A = D>(opts: Readable<D> & AsyncMutable<D, A>): MutableRef<D, A, Readable<D>, AsyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: Readable<D> & SyncMutable<D, A>): MutableRef<D, A, Readable<D>, SyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: Readable<D> & Mutable<D, A>): MutableRef<D, A>;

export function mutable$<D, A = D>(opts: Readable<D> & Mutable<D, A>): MutableRef<D, A> {
  const ref = ref$<D>(opts.read);

  function emit(val: D) {
    ref.next(val);
    return val;
  }

  return Object.assign(ref, {
    mutate: (arg: A) => awaitedCall(emit, opts.mutate(arg))
  });
}
