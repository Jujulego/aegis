import { Awaitable } from '@jujulego/utils';

// Utils
export function isPromise<T>(obj: Awaitable<T>): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj !== null && 'then' in obj;
}

export function awaitedCall<A, R>(arg: PromiseLike<A>, fn: (arg: A) => PromiseLike<R>): PromiseLike<R>;
export function awaitedCall<A, R>(arg: PromiseLike<A>, fn: (arg: A) => R): PromiseLike<R>;
export function awaitedCall<A, R>(arg: A, fn: (arg: A) => PromiseLike<R>): PromiseLike<R>;
export function awaitedCall<A, R>(arg: A, fn: (arg: A) => R): R;
export function awaitedCall<A, R>(arg: Awaitable<A>, fn: (arg: A) => Awaitable<R>): Awaitable<R>;
export function awaitedCall<A, R>(arg: Awaitable<A>, fn: (arg: A) => Awaitable<R>): Awaitable<R> {
  return isPromise(arg) ? arg.then(fn) : fn(arg);
}
