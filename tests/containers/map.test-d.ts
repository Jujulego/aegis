import { describe, assertType } from 'vitest';

import { map$ } from '@/src/containers/map.js';
import { ref$ } from '@/src/refs/ref.js';
import { var$ } from '@/src/refs/var.js';

// Tests
describe('RefMap.values', () => {
  it('should be a sync iterable iterator on number for synchronous map', () => {
    const map = map$((key: string, value: number) => var$(value));

    assertType<IterableIterator<number>>(map.values());
  });

  it('should be an async iterable on number for synchronous map', () => {
    const map = map$((key: string, value: number) => var$(value));

    assertType<AsyncIterable<number>>(map.values());
  });

  it('should be a sync iterator on Promise<number> for asynchronous map', () => {
    const map = map$((key: string, val: number) => ref$<number, number>({
      read: async () => val,
      mutate: arg => arg
    }));

    assertType<Iterable<Promise<number>>>(map.values());
  });

  it('should be an async iterable iterator on number for asynchronous map', () => {
    const map = map$((key: string, val: number) => ref$<number, number>({
      read: async () => val,
      mutate: arg => arg
    }));

    assertType<AsyncIterableIterator<number>>(map.values());
  });
});

describe('RefMap.entries', () => {
  it('should be a sync iterable iterator on [string, number] for synchronous map', () => {
    const map = map$((key: string, value: number) => var$(value));

    assertType<IterableIterator<[string, number]>>(map.entries());
  });

  it('should be an async iterable on [string, number] for synchronous map', () => {
    const map = map$((key: string, value: number) => var$(value));

    assertType<AsyncIterable<[string, number]>>(map.entries());
  });

  it('should be a sync iterable on [string, Promise<number>] for asynchronous map', () => {
    const map = map$((key: string, val: number) => ref$<number, number>({
      read: async () => val,
      mutate: arg => arg
    }));

    assertType<Iterable<[string, Promise<number>]>>(map.entries());
  });

  it('should be an async iterable iterator on [string, number] for asynchronous map', () => {
    const map = map$((key: string, val: number) => ref$<number, number>({
      read: async () => val,
      mutate: arg => arg
    }));

    assertType<AsyncIterableIterator<[string, number]>>(map.entries());
  });
});
