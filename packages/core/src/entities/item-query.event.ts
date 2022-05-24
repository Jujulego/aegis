import { TypedEvent, TypedEventListener } from '../event-target';
import { AegisQuery, QueryState, QueryStatus } from '../protocols';

import { AegisEntity } from './entity';
import { AegisItem } from './item';

export class ItemQueryEvent<T = unknown> extends TypedEvent<'query'> {
  // Constructor
  constructor(
    readonly item: AegisItem<T>,
    readonly query: AegisQuery<T>,
  ) {
    super('query');
  }

  // Properties
  get entity(): AegisEntity<T> {
    return this.item.entity;
  }

  get status(): QueryStatus {
    return this.query.status;
  }

  get state(): Readonly<QueryState<T>> {
    return this.query.state;
  }
}

export type ItemQueryEventListener<T = unknown> = TypedEventListener<ItemQueryEvent<T>>;
