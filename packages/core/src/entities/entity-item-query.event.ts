import { TypedEvent, TypedEventListener } from '../event-target';
import { AegisQuery } from '../protocols';
import { AegisEntity } from './entity';

// Events
export class EntityItemQueryEvent<T = unknown> extends TypedEvent<'item-query'> {
  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly id: string,
    readonly query: AegisQuery<T>,
  ) {
    super('item-query');
  }
}

export type EntityItemQueryEventListener<T = unknown> = TypedEventListener<EntityItemQueryEvent<T>>;
