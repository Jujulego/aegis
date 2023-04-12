import { KeyPart } from '@jujulego/event-tree';

// Types
export interface DataRepository<D, K extends KeyPart = KeyPart> {
  read(key: K): D | undefined;
}

// Events
export interface StoreUpdateEvent<D, K extends KeyPart = KeyPart> {
  key: K;
  data: D;
  old?: D;
}

export interface StoreDeleteEvent<D, K extends KeyPart = KeyPart> {
  key: K;
  old: D;
}

export type StoreEvent<D, K extends KeyPart = KeyPart> =
  | StoreUpdateEvent<D, K>
  | StoreDeleteEvent<D, K>;
