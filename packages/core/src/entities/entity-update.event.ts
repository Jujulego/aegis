import { TypedEvent, TypedEventListener } from '../event-target';
import { StoreUpdateEvent } from '../stores';

import { AegisEntity } from './entity';

// Events
export class EntityUpdateEvent<T = unknown> extends TypedEvent<'update'> {
  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly storeEvent: StoreUpdateEvent<T>,
  ) {
    super('update');
  }

  // Properties
  get id(): string {
    return this.storeEvent.id;
  }

  get newValue(): Readonly<T> {
    return this.storeEvent.newValue;
  }

  get oldValue(): Readonly<T> | undefined {
    return this.storeEvent.oldValue;
  }
}

export type EntityUpdateEventListener<T = unknown> = TypedEventListener<EntityUpdateEvent<T>>;
