import { Query, RefreshStrategy } from '@jujulego/aegis-core';

// Types
export type AegisId = string | number | (string | number)[];
export type AegisIdExtractor<A extends unknown[], I extends AegisId> = (...args: A) => I;

export type AegisProtocol = Record<string, unknown>;

export interface Refreshable<T> {
  refresh(strategy?: RefreshStrategy): Query<T>;
}
