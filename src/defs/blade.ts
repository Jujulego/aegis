/**
 * Blade logic
 */
export type Blade<D, A extends unknown[]> = (...args: A) => D | PromiseLike<D>;
