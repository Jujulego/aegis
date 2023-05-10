import { source, waitFor } from '@jujulego/event-tree';

import { Blade, ReadonlyRef } from './defs';

/**
 *
 */
export class Aegis<D, A extends unknown[]> implements ReadonlyRef<D> {
  // Attributes
  private _data?: D;
  private _args?: A;

  private readonly _events = source<D>();

  // Constructor
  constructor(readonly blade: Blade<D, A>) {}

  // Methods
  readonly subscribe = this._events.subscribe;
  readonly unsubscribe = this._events.unsubscribe;
  readonly clear = this._events.clear;

  private _needRefresh(args: A): boolean {
    if (!this._args || this._args.length !== args.length) {
      return true;
    }

    return this._args.some((arg, idx) => args[idx] !== arg);
  }

  async read(): Promise<D> {
    if (this._data === undefined) {
      return waitFor(this._events);
    }

    return this._data;
  }

  async refresh(...args: A): Promise<D> {
    // Check args
    if (this._data && !this._needRefresh(args)) {
      return this._data;
    }

    // Refresh
    this._args = args;
    this._data = await this.blade(...args);
    this._events.emit(this._data);

    return this._data;
  }

  // Properties
  get data(): D | undefined {
    return this._data;
  }

  get isEmpty(): boolean {
    return !this._data;
  }
}

/**
 *
 */
export function aegis<D, A extends unknown[]>(blade: Blade<D, A>): Aegis<D, A> {
  return new Aegis(blade);
}