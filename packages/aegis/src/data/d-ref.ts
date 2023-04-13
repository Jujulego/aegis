import { group, IListenable, IObservable, source, waitFor } from '@jujulego/event-tree';

import { DataAccessor, StoreDeleteEvent, StoreEvent, StoreUpdateEvent } from './types';

// Types
export type DRefEventMap<D> = {
  update: StoreUpdateEvent<D>;
  delete: StoreDeleteEvent<D>;
};

// Class
export class DRef<D> implements IObservable<StoreEvent<D>>, IListenable<DRefEventMap<D>> {
  // Attributes
  private readonly _events = group({
    update: source<StoreUpdateEvent<D>>(),
    delete: source<StoreDeleteEvent<D>>(),
  });

  // Constructor
  constructor(
    private readonly accessor: DataAccessor<D>,
  ) {}

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly subscribe = this._events.subscribe;
  readonly unsubscribe = this._events.unsubscribe;
  readonly clear = this._events.clear;

  async read(): Promise<D> {
    let data = this.data;

    if (data === undefined) {
      const event = await waitFor(this._events, 'update');
      data = event.data;
    }

    return data;
  }

  update(data: D): void {
    const old = this.accessor.read();
    this.accessor.update(data);

    this._events.emit('update', { data, old });
  }

  // Properties
  get data(): D | undefined {
    return this.accessor.read();
  }
}
