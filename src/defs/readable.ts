import { Awaitable } from '@jujulego/utils';

export interface IReadable<D> {
  /**
   * Return current value
   */
  read(): Awaitable<D>;
}

export interface ISyncReadable<D> extends IReadable<D> {
  /**
   * Return current value
   */
  read(): D;
}

export interface IAsyncReadable<D> extends IReadable<D> {
  /**
   * Return current value asynchronously
   */
  read(): PromiseLike<D>;
}
