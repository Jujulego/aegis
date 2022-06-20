import { EventEmitter, EventListener, EventListenerOptions, EventUnsubscribe } from '../events';
import { AegisItem } from '../items';
import { AegisList } from '../lists';
import { AegisStore, StoreUpdateEvent } from '../stores';

// Types
export type EntityIdExtractor<T> = (entity: T) => string;

// Class
export class $AegisEntity<T> implements EventEmitter {
  // Attributes
  private readonly _items = new Map<string, WeakRef<AegisItem<T>>>();
  private readonly _lists = new Map<string, WeakRef<AegisList<T>>>();

  // Constructor
  constructor(
    readonly name: string,
    readonly store: AegisStore,
    readonly extractor: EntityIdExtractor<T>
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

  item(id: string): AegisItem<T> {
    let item = this._items.get(id)?.deref();

    if (!item) {
      item = new AegisItem(this, id);
      this._items.set(id, new WeakRef(item));
    }

    return item;
  }

  list(key: string): AegisList<T> {
    let list = this._lists.get(key)?.deref();

    if (!list) {
      list = new AegisList(this, key);
      this._lists.set(key, new WeakRef(list));
    }

    return list;
  }

  getItem(id: string): T | undefined {
    return this.store.get(this.name, id);
  }

  setItem(id: string, value: T): T | undefined {
    return this.store.set(this.name, id, value);
  }

  storeItem(item: T): string {
    const id = this.extractor(item);
    this.setItem(id, item);

    return id;
  }
}
