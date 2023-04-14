import { IListenable, inherit, IObservable, lazy, PrependEventMapKeys } from '@jujulego/event-tree';
import { Query } from '@jujulego/utils';

import { DRef, DRefEventMap, DVar, StoreEvent } from '@/src/data';
import { Fetcher, QRef, QRefEventMap, Strategy } from '@/src/query';

// Types
export type BRefEventMap<D> = DRefEventMap<D> & PrependEventMapKeys<'status', QRefEventMap<D>>;

// Class
export class BRef<D> implements IObservable<StoreEvent<D>>, IListenable<BRefEventMap<D>> {
  // Attributes
  private readonly _events = inherit(lazy(() => this.ref), {
    status: lazy(() => this.query)
  });

  // Constructor
  constructor(
    readonly query: QRef<D> = new QRef(),
    readonly ref: DRef<D> = new DVar(),
  ) {
    // Setup
    this.query.on('done', ({ data }) => this.ref.update(data));

    if (!this.query.isLoading && this.query.data !== undefined) {
      this.ref.update(this.query.data);
    }
  }

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly subscribe = this._events.subscribe;
  readonly unsubscribe = this._events.unsubscribe;
  readonly clear = this._events.clear;

  refresh(fetcher: Fetcher<D>, strategy: Strategy): Query<D> {
    return this.query.refresh(fetcher, strategy);
  }

  cancel() {
    return this.query.cancel();
  }

  async read(): Promise<D> {
    return this.ref.read();
  }

  update(data: D): void {
    this.ref.update(data);
  }

  // Properties
  get data(): D | undefined {
    return this.ref.data ?? this.query.data;
  }
}