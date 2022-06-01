import { TypedEvent, TypedEventListener } from '../event-target';
import { AegisQuery } from '../protocols';

import { AegisEntity } from './entity';
import { AegisItem } from './item';

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

  get id(): string {
    return this.item.id;
  }

  get data(): T | undefined {
    return this.item.data;
  }

  get isPending(): boolean {
    return this.item.isPending;
  }

  get lastQuery(): AegisQuery<T> | undefined {
    return this.item.lastQuery;
  }

  get lastError(): Error | undefined {
    return this.item.lastError;
  }
}

export type ItemUpdateEventListener<T = unknown> = TypedEventListener<ItemUpdateEvent<T>>;
