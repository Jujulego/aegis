import {
  dynamic,
  IListenable,
  inherit,
  IObservable,
  lazy,
  once,
  PrependEventMapKeys,
  source, waitFor
} from '@jujulego/event-tree';
import { Query, QueryEventMap } from '@jujulego/utils';

import { DRef, DRefEventMap, StoreEvent } from '@/src/data';
import { QRef } from '@/src/query';
import { BRef } from '@/src/blade/b-ref';

// Types
export type DGetter<D> = (data: D) => DRef<D>;

export type FRefEventMap<D> = DRefEventMap<D> & PrependEventMapKeys<'query', QueryEventMap<D>>;

/**
 * Future ref. Reference to data stored in an unknown DRef.
 */
export class FRef<D> implements IObservable<StoreEvent<D>>, IListenable<FRefEventMap<D>> {
  // Attributes
  private readonly _getter: DGetter<D>;

  private _ref?: DRef<D>;
  private readonly _ref$ = source<DRef<D>>();

  private readonly _events = inherit(dynamic(this._ref$), {
    query: lazy(() => this.query)
  });

  // Constructor
  constructor(
    readonly query: Query<D>,
    getter: DGetter<D>
  ) {
    this._getter = getter;

    // Setup query
    once(query, 'done', ({ data }) => this._handleUpdate(data));

    if (this.query.state.status === 'done') {
      this._handleUpdate(this.query.state.data);
    }
  }

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly subscribe = this._events.subscribe;
  readonly unsubscribe = this._events.unsubscribe;
  readonly clear = this._events.clear;

  private _handleUpdate(data: D) {
    if (!this._ref) {
      this._ref = this._getter(data);
    }

    this._ref.update(data);
  }

  convert(qref: QRef<D>): BRef<D> {
    if (!this._ref) {
      throw new Error('Cannot convert a FRef without DRef');
    }

    return new BRef<D>(qref, this._ref);
  }

  cancel() {
    return this.query.cancel();
  }

  async read(): Promise<D> {
    let data = this.data;

    if (data === undefined) {
      const event = await waitFor(this._events, 'update');
      data = event.data;
    }

    return data;
  }

  update(data: D): void {
    this._handleUpdate(data);
  }

  // Properties
  get hasRef(): boolean {
    return !!this._ref;
  }

  get data(): D | undefined {
    return this._ref?.data ?? this.query.data;
  }
}
