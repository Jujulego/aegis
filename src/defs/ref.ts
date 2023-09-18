import { IEmitter, IObservable } from '@jujulego/event-tree';

import { AsyncReadable, MapReadValue, Readable, SyncReadable } from './readable.js';

/**
 * Reference events
 */
export type RefEvents<D = unknown> = IEmitter<D> & IObservable<D>;

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
