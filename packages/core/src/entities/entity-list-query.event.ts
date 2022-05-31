import { TypedEvent, TypedEventListener } from '../event-target';
import { AegisEntity } from './entity';
import { AegisQuery } from '../protocols';

// Events
export class EntityListQueryEvent<T = unknown> extends TypedEvent<'list-query'> {
  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly id: string,
    readonly query: AegisQuery<T[]>,
  ) {
    super('list-query');
  }
}

export type EntityListQueryEventListener<T = unknown> = TypedEventListener<EntityListQueryEvent<T>>;
