import { TypedEventListener } from '../event-target';

// Events
export class StoreUpdateEvent<T = unknown> extends Event {
  // Attributes
  type: 'update';

  // Constructor
  constructor(
    readonly entity: string,
    readonly id: string,
    readonly newValue: Readonly<T>,
    readonly oldValue?: Readonly<T>,
  ) {
    super('update');
  }
}

export type StoreUpdateEventListener<T = unknown> = TypedEventListener<StoreUpdateEvent<T>>;
