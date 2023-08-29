import { Awaitable } from '@jujulego/utils';

export interface IMutable<D, A = D> {
  /**
   * Mutate current value
   */
  mutate(arg: A): Awaitable<D>;
}

export interface ISyncMutable<D, A = D> extends IMutable<D, A> {
  /**
   * Mutate current value synchronously
   */
  mutate(arg: A): D;
}

export interface IAsyncMutable<D, A = D> extends IMutable<D, A> {
  /**
   * Mutate current value asynchronously
   */
  mutate(arg: A): PromiseLike<D>;
}
