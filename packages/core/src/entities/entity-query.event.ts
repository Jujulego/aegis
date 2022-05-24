import { TypedEvent, TypedEventListener } from '../event-target';
import { AegisQuery } from '../protocols';
import { AegisEntity } from './entity';

export class EntityQueryEvent<T = unknown> extends TypedEvent<'query'> {
  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly id: string,
    readonly query: AegisQuery<T>,
  ) {
    super('query');
  }
}

export type EntityQueryEventListener<T = unknown> = TypedEventListener<EntityQueryEvent<T>>;
