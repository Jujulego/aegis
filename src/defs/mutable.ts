import { Awaitable } from '@jujulego/utils';

/**
 * Defines an object that can be mutated
 */
export interface Mutable<D = unknown, A = D> {
  /**
   * Mutate current value
   */
  mutate(arg: A): Awaitable<D>;
}

/**
 * Defines an object that can be synchronously mutated
 */
export interface SyncMutable<D = unknown, A = D> extends Mutable<D, A> {
  /**
   * Mutate current value synchronously
   */
  mutate(arg: A): D;
}

/**
 * Defines an object that can be asynchronously mutated
 */
export interface AsyncMutable<D = unknown, A = D> extends Mutable<D, A> {
  /**
   * Mutate current value asynchronously
   */
  mutate(arg: A): PromiseLike<D>;
}

// Utils
/**
 * Extract mutate value type
 */
export type MutateArg<M extends Mutable> =
  M extends AsyncMutable<unknown, infer A>
    ? A
    : M extends SyncMutable<unknown, infer A>
      ? A
      : never;

/**
 * Build a Mutable type with the same synchronicity and the given value type
 */
export type MapMutateArg<M extends Mutable, D, A> =
  M extends AsyncMutable
    ? AsyncMutable<D, A>
    : M extends SyncMutable
      ? SyncMutable<D, A>
      : never;
