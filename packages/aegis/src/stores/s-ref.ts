import { group, IListenable, IObservable, KeyPart, source, waitFor } from '@jujulego/event-tree';

import { DataRepository, StoreDeleteEvent, StoreEvent, StoreUpdateEvent } from './types';

// Types
export type SRefEventMap<D, K extends KeyPart = KeyPart> = {
  update: StoreUpdateEvent<D, K>;
  delete: StoreDeleteEvent<D, K>;
};

// Class
export class SRef<D, K extends KeyPart = KeyPart> implements IObservable<StoreEvent<D, K>>, IListenable<SRefEventMap<D, K>> {
  // Attributes
  private readonly _events = group({
    update: source<StoreUpdateEvent<D, K>>(),
    delete: source<StoreDeleteEvent<D, K>>(),
  });

  // Constructor
  constructor(
    readonly key: K,
    private readonly accessor: DataRepository<D, K>,
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

  // Properties
  get data(): D | undefined {
    return this.accessor.read(this.key);
  }
}
