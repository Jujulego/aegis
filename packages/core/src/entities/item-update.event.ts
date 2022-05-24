import { TypedEvent, TypedEventListener } from '../event-target';

import { EntityUpdateEvent } from './entity-update.event';
import { AegisEntity } from './entity';
import { AegisItem } from './item';

export class ItemUpdateEvent<T = unknown> extends TypedEvent<'update'> {
  // Constructor
  constructor(
    readonly item: AegisItem<T>,
    readonly entityEvent: EntityUpdateEvent<T>,
  ) {
    super('update');
  }

  // Properties
  get entity(): AegisEntity<T> {
    return this.item.entity;
  }

  get newValue(): Readonly<T> {
    return this.entityEvent.newValue;
  }

  get oldValue(): Readonly<T> | undefined {
    return this.entityEvent.oldValue;
  }
}

export type ItemUpdateEventListener<T = unknown> = TypedEventListener<ItemUpdateEvent<T>>;
