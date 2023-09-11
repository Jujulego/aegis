import { Awaitable } from '@jujulego/utils';

// Utils
export function isPromise<T>(obj: Awaitable<T>): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj !== null && 'then' in obj;
}

export function awaitedCall<A, R>(fn: (arg: A) => PromiseLike<R>, arg: PromiseLike<A>): PromiseLike<R>;
export function awaitedCall<A, R>(fn: (arg: A) => R, arg: PromiseLike<A>): PromiseLike<R>;
export function awaitedCall<A, R>(fn: (arg: A) => PromiseLike<R>, arg: A): PromiseLike<R>;
export function awaitedCall<A, R>(fn: (arg: A) => R, arg: A): R;
export function awaitedCall<A, R>(fn: (arg: A) => Awaitable<R>, arg: Awaitable<A>): Awaitable<R>;

export function awaitedCall<A, R>(fn: (arg: A) => Awaitable<R>, arg: Awaitable<A>): Awaitable<R> {
  return isPromise(arg) ? arg.then(fn) : fn(arg);
}
