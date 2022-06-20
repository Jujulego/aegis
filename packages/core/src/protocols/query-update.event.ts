import { Event } from '../events';

import { QueryState } from './query-state';

// Type
export interface QueryUpdateEventData<out T> {
  old?: Readonly<QueryState<T>>;
  data: Readonly<QueryState<T>>;
}

export interface QueryUpdateEvent<out T = unknown> extends Event<'update', QueryUpdateEventData<T>> {
  // Attributes
  key?: ['completed' | 'error'];
}
