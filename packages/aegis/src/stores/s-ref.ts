import { group, IListenable, IObservable, KeyPart, source, waitFor } from '@jujulego/event-tree';

// Types
export interface SRefAccessor<D> {
  read(): D | undefined;
}

export interface SRefUpdateEvent<D, K extends KeyPart = KeyPart> {
  key: K;
  data: D;
  old?: D;
}

export interface SRefDeleteEvent<D, K extends KeyPart = KeyPart> {
  key: K;
  old: D;
}

export type SRefEvent<D, K extends KeyPart = KeyPart> =
  | SRefUpdateEvent<D, K>
  | SRefDeleteEvent<D, K>;

export type SRefEventMap<D, K extends KeyPart = KeyPart> = {
  update: SRefUpdateEvent<D, K>;
  delete: SRefDeleteEvent<D, K>;
};

// Class
export class SRef<D, K extends KeyPart = KeyPart> implements IObservable<SRefEvent<D, K>>, IListenable<SRefEventMap<D, K>> {
  // Attributes
  private readonly _events = group({
    update: source<SRefUpdateEvent<D, K>>(),
    delete: source<SRefDeleteEvent<D, K>>(),
  });

  // Constructor
  constructor(
    readonly key: K,
    private readonly accessor: SRefAccessor<D>,
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
    return this.accessor.read();
  }
}
