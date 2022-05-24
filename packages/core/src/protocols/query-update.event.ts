import { TypedEvent, TypedEventListener } from '../event-target';

import { QueryState } from './types';

/**
 * Emitted when a query is updated
 */
export class QueryUpdateEvent<T> extends TypedEvent<'update'> {
  // Constructor
  constructor(readonly state: Readonly<QueryState<T>>) {
    super('update');
  }
}

export type QueryUpdateEventListener<T> = TypedEventListener<QueryUpdateEvent<T>>
