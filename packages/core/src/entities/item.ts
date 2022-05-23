import { AegisQuery } from '../protocols';

import { AegisEntity } from './entity';

// Resource
export class AegisItem<T> {
  // Attributes
  private _query?: WeakRef<AegisQuery<T>>;

  // Constructor
  constructor(
    readonly entity: AegisEntity<T>,
    readonly id: string,
    query?: AegisQuery<T>,
  ) {
    // Store query ref
    if (query) {
      this._query = new WeakRef(query);
    }

    // Listen for query update
    this.entity.addEventListener('query', (event) => {
      this._query = new WeakRef(event.query);
    });
  }

  // Properties
  get lastQuery(): AegisQuery<T> | undefined {
    return this._query?.deref();
  }

  get data() {
    return this.entity.store.get<T>(this.entity.name, this.id);
  }

  get isPending() {
    return this.lastQuery?.status === 'pending';
  }

  get lastError() {
    if (this.lastQuery?.state?.status === 'error') {
      return this.lastQuery.state.data;
    }
  }
}
