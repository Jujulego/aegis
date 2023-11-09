import { Awaitable } from '@jujulego/utils';

// Types
export type YieldMap<V, R> = (val: V) => Awaitable<IteratorResult<R>>;
export type YieldMapSync<V, R> = (val: V) => IteratorResult<R>;
export type YieldMapAsync<V, R> = (val: V) => Promise<IteratorResult<R>>;

// Utils
export function asyncIterMapper<V, const R>(it: Iterator<V>, map: YieldMapAsync<V, R>): AsyncIterableIterator<R> {
  return {
    next: yieldMapper(it, map),
    [Symbol.asyncIterator]() { return this; }
  };
}

export function iterMapper<V, const R>(it: Iterator<V>, map: YieldMapSync<V, R>): IterableIterator<R> {
  return {
    next: yieldMapper(it, map),
    [Symbol.iterator]() { return this; }
  };
}

export function yieldMapper<V, const R>(it: Iterator<V>, map: YieldMapAsync<V, R>): () => Promise<IteratorResult<R>>;
export function yieldMapper<V, const R>(it: Iterator<V>, map: YieldMapSync<V, R>): () => IteratorResult<R>;
export function yieldMapper<V, const R>(it: Iterator<V>, map: YieldMap<V, R>): () => Awaitable<IteratorResult<R>>;

export function yieldMapper<V, const R>(it: Iterator<V>, map: YieldMap<V, R>): () => Awaitable<IteratorResult<R>> {
  return () => {
    const next = it.next();
    return next.done ? next : map(next.value);
  };
}
