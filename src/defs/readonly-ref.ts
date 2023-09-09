import { IObservable } from '@jujulego/event-tree';

/**
 * Readonly reference
 */
export interface ReadonlyRef<D = unknown> extends IObservable<D> {
  // Attributes
  readonly isEmpty: boolean;
  readonly data: D | undefined;

  // Methods
  read(): PromiseLike<D>;
}