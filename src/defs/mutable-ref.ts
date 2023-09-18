import { AsyncMutable, MapMutateArg, Mutable, SyncMutable } from './mutable.js';
import { AsyncReadable, MapReadValue, Readable, SyncReadable } from './readable.js';
import { Ref } from './ref.js';

/**
 * Mutable reference
 */
export type MutableRef<D = unknown, A = D, R extends Readable<D> = Readable<D>, M extends Mutable<D, A> = Mutable<D, A>> = Ref<D, R> & M;

/**
 * Mutable synchronous reference
 */
export type SyncMutableRef<D = unknown, A = D> = MutableRef<D, A, SyncReadable<D>, SyncMutable<D, A>>;

/**
 * Mutable asynchronous reference
 */
export type AsyncMutableRef<D = unknown, A = D> = MutableRef<D, A, AsyncReadable<D>, AsyncMutable<D, A>>;

/**
 * Build a Mutable type with the same synchronicity and the given value types
 */
export type MapMutableValue<R extends MutableRef, D, A> = MutableRef<D, A, MapReadValue<R, D>, MapMutateArg<R, D, A>>;
