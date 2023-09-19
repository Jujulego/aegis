import { Source } from '@jujulego/event-tree';

import { AsyncReadable, MapReadValue, Readable, SyncReadable } from './readable.js';

/**
 * Readonly reference
 */
export type Ref<D = unknown, R extends Readable<D> = Readable<D>> = R & Source<D>;

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
export type MapRefValue<R extends Readable, D> = Ref<D, MapReadValue<R, D>>;
