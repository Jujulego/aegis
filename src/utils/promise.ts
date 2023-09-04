import { Awaitable } from '@jujulego/utils';

// Utils
export function isPromise<T>(obj: Awaitable<T>): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj !== null && 'then' in obj;
}

export function callWithAwaitable<A, R>(arg: Awaitable<A>, fn: (arg: A) => Awaitable<R>): Awaitable<R> {
  return isPromise(arg) ? arg.then(fn) : fn(arg);
}
