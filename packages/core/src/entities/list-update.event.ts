import { TypedEvent, TypedEventListener } from '../event-target';
import { AegisQuery } from '../protocols';

import { AegisEntity } from './entity';
import { AegisList } from './list';

export class ListUpdateEvent<T = unknown> extends TypedEvent<'update'> {
  // Constructor
  constructor(
    readonly list: AegisList<T>,
  ) {
    super('update');
  }

  // Properties
  get entity(): AegisEntity<T> {
    return this.list.entity;
  }

  get key(): string {
    return this.list.key;
  }

  get data(): T[] {
    return this.list.data;
  }

  get isPending(): boolean {
    return this.list.isPending;
  }

  get lastQuery(): AegisQuery<T[]> | undefined {
    return this.list.lastQuery;
  }

  get lastError(): Error | undefined {
    return this.list.lastError;
  }
}

export type ListUpdateEventListener<T = unknown> = TypedEventListener<ListUpdateEvent<T>>;
