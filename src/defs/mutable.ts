import { Awaitable } from '@jujulego/utils';

export interface Mutable<D, A = D> {
  /**
   * Mutate current value
   */
  mutate(arg: A): Awaitable<D>;
}

export interface SyncMutable<D, A = D> extends Mutable<D, A> {
  /**
   * Mutate current value synchronously
   */
  mutate(arg: A): D;
}

export interface AsyncMutable<D, A = D> extends Mutable<D, A> {
  /**
   * Mutate current value asynchronously
   */
  mutate(arg: A): PromiseLike<D>;
}
