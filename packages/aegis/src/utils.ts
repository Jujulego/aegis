import { Query, RefreshStrategy } from '@jujulego/aegis-core';

// Types
export type AegisId = string | number | readonly (string | number)[];
export type AegisIdExtractor<A extends unknown[], I extends AegisId> = (...args: A) => I;

export type AegisProtocol = Record<string, Fetcher<any[], any>>;

export interface Refreshable<T> {
  refresh(strategy?: RefreshStrategy): Query<T>;
}

export type Fetcher<A extends unknown[], R> = (...args: A) => R;

// Utils
export function $queryfy<D>(prom: PromiseLike<D>): Query<D> {
  return prom instanceof Query ? prom : Query.fromPromise(prom);
}
