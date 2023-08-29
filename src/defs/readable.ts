import { Awaitable } from '@jujulego/utils';

export interface Readable<D> {
  /**
   * Return current value
   */
  read(): Awaitable<D>;
}

export interface SyncReadable<D> extends Readable<D> {
  /**
   * Return current value
   */
  read(): D;
}

export interface AsyncReadable<D> extends Readable<D> {
  /**
   * Return current value asynchronously
   */
  read(): PromiseLike<D>;
}
