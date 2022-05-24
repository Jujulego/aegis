import { TypedEvent, TypedEventListener } from '../event-target';

import { AegisEntity } from './entity';
import { AegisItem } from './item';
import { AegisQuery } from '../protocols';

export class ItemUpdateEvent<T = unknown> extends TypedEvent<'update'> {
  // Constructor
  constructor(
    readonly item: AegisItem<T>,
  ) {
    super('update');
  }

  // Properties
  get entity(): AegisEntity<T> {
    return this.item.entity;
  }

  get lastQuery(): AegisQuery<T> | undefined {
    return this.item.lastQuery;
  }

  get data(): T | undefined {
    return this.item.data;
  }

  get isPending(): boolean {
    return this.item.isPending;
  }

  get lastError(): Error | undefined {
    return this.item.lastError;
  }
}

export type ItemUpdateEventListener<T = unknown> = TypedEventListener<ItemUpdateEvent<T>>;
