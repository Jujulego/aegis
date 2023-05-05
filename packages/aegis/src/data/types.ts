// Types
export interface DataAccessor<D> {
  isEmpty?: () => boolean;
  read(): D | undefined;
  update(data: D): void;
}

// Events
export interface StoreUpdateEvent<D> {
  data: D;
  old?: D;
}

export interface StoreDeleteEvent<D> {
  old: D;
}

export type StoreEvent<D> = StoreUpdateEvent<D> | StoreDeleteEvent<D>;
