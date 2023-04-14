import { lazy, multiplexer, source } from '@jujulego/event-tree';
import { Query } from '@jujulego/utils';

import { DRef, DVar } from '@/src/data';
import { Fetcher, QRef, Strategy } from '@/src/query';

// Class
export class BRef<D> {
  // Constructor
  constructor(
    readonly query: QRef<D> = new QRef(),
    readonly ref: DRef<D> = new DVar(),
  ) {
    // Setup
    this.query.on('done', ({ data }) => this.ref.update(data));

    if (!this.query.isLoading && this.query.data !== undefined) {
      this.ref.update(this.query.data);
    }
  }

  // Methods
  refresh(fetcher: Fetcher<D>, strategy: Strategy): Query<D> {
    return this.query.refresh(fetcher, strategy);
  }

  cancel() {
    return this.query.cancel();
  }

  async read(): Promise<D> {
    return this.ref.read();
  }

  update(data: D): void {
    this.ref.update(data);
  }

  // Properties
  get data(): D | undefined {
    return this.ref.data ?? this.query.data;
  }
}