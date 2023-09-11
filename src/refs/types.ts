import { IEmitter, IObservable } from '@jujulego/event-tree';

import {
  AsyncMutable,
  AsyncReadable,
  MapMutateArg,
  MapReadValue,
  Mutable,
  Readable,
  SyncMutable,
  SyncReadable
} from '../defs/index.js';

// Commons
/**
 * Reference events
 */
export type RefEvents<D = unknown> = IEmitter<D> & IObservable<D>;

// Readonly references
/**
 * Readonly reference
 */
export type Ref<D = unknown, R extends Readable<D> = Readable<D>> = R & RefEvents<D>;

/**
 * Readonly synchronous reference
 */
export type SyncRef<D = unknown> = Ref<D, SyncReadable<D>>;

/**
 * Readonly asynchronous reference
 */
export type AsyncRef<D = unknown> = Ref<D, AsyncReadable<D>>;

/**
 * Build a Ref type with the same synchronicity and the given value type
 */
export type MapRefValue<R extends Ref, D> = Ref<D, MapReadValue<R, D>>;

// Mutable references
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
