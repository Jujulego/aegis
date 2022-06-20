import { EventEmitter, EventListener, EventListenerOptions, EventUnsubscribe } from '../events';
import { AegisItem } from '../items';
import { AegisStore, StoreUpdateEvent } from '../stores';

// Class
export class $AegisEntity<T> implements EventEmitter {
  // Attributes
  private readonly _items = new Map<string, AegisItem<T>>();

  // Constructor
  constructor(
    readonly name: string,
    readonly store: AegisStore,
  ) {}

  // Methods
  subscribe(
    type: 'update',
    listener: EventListener<StoreUpdateEvent<T>>,
    opts: Omit<EventListenerOptions<StoreUpdateEvent<T>>, 'key'> & { key?: [string] } = {}
  ): EventUnsubscribe {
    const { key = [] } = opts;
    return this.store.subscribe('update', listener, { ...opts, key: [this.name, ...key] });
  }

  getItem(id: string): AegisItem<T> {
    let item = this._items.get(id);

    if (!item) {
      item = new AegisItem(this, id);
      this._items.set(id, item);
    }

    return item;
  }
}
