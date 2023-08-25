import { source, waitFor } from '@jujulego/event-tree';

import { DataAccessor, OldRef } from '../defs/index.js';

/**
 * Reference on locally stored data.
 */
export class DRef<D = unknown> implements OldRef<D> {
  // Attributes
  private readonly _events = source<D>();

  // Constructor
  constructor(
    private readonly accessor: DataAccessor<D>,
  ) {}

  // Methods
  readonly subscribe = this._events.subscribe;
  readonly unsubscribe = this._events.unsubscribe;
  readonly clear = this._events.clear;

  /**
   * Resolves to the stored data. If no data is stored, waits for the next update.
   */
  async read(): Promise<D> {
    const data = this.data;

    if (data === undefined) {
      return waitFor(this._events);
    }

    return data;
  }

  update(data: D): void {
    this.accessor.update(data);
    this._events.next(data);
  }

  // Properties
  get data(): D | undefined {
    return this.accessor.read();
  }

  get isEmpty(): boolean {
    if (this.accessor.isEmpty) {
      return this.accessor.isEmpty();
    }

    return this.accessor.read() === undefined;
  }
}
