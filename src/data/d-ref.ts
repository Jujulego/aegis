import { source, waitFor } from '@jujulego/event-tree';

import { Ref } from '../defs/index.js';

import { DataAccessor } from './types.js';

// Class
export class DRef<D = unknown> implements Ref<D> {
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
