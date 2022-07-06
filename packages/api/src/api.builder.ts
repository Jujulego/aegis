import { Query } from '@jujulego/aegis-core';
import axios, { AxiosRequestConfig } from 'axios';

import { $url, ApiUrlArg } from './url';

// Types
export type ApiQuery<T, P extends string[]> = (arg: ApiUrlArg<P>, opts?: Omit<AxiosRequestConfig, 'signal'>) => Query<T>;

export interface ApiBodyQuery<T, D, P extends string[]> {
  // Call
  (arg: ApiUrlArg<P>, body: D, opts?: Omit<AxiosRequestConfig<D>, 'signal'>): Query<T>

  // Methods
  withBody<B>(): ApiBodyQuery<T, B, P>;
}

// Builder
export const $api = {
  /**
   * Generate a GET request at the given url
   */
  get<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiQuery<T, P> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts = {}) => {
      const ctrl = new AbortController();
      return Query.fromPromise(
        axios.get<T>(builder(arg), { ...opts, signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    };
  },

  /**
   * Generate a HEAD request at the given url
   */
  head<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiQuery<T, P> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts = {}) => {
      const ctrl = new AbortController();
      return Query.fromPromise(
        axios.head<T>(builder(arg), { ...opts, signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    };
  },

  /**
   * Generate a OPTIONS request at the given url
   */
  options<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiQuery<T, P> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts = {}) => {
      const ctrl = new AbortController();
      return Query.fromPromise(
        axios.options<T>(builder(arg), { ...opts, signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    };
  },

  /**
   * Generate a DELETE request at the given url
   */
  delete<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiQuery<T, P> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts = {}) => {
      const ctrl = new AbortController();
      return Query.fromPromise(
        axios.delete<T>(builder(arg), { ...opts, signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    };
  },

  /**
   * Generate a POST request at the given url
   */
  post<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiBodyQuery<T, unknown, P> {
    const builder = $url<P>(strings, ...param);

    return Object.assign((arg: ApiUrlArg<P>, body: unknown, opts = {}) => {
      const ctrl = new AbortController();
      return Query.fromPromise(
        axios.post<T>(builder(arg), body, { ...opts, signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    }, {
      withBody() { return this; }
    });
  },

  /**
   * Generate a PUT request at the given url
   */
  put<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiBodyQuery<T, unknown, P> {
    const builder = $url<P>(strings, ...param);

    return Object.assign((arg: ApiUrlArg<P>, body: unknown, opts = {}) => {
      const ctrl = new AbortController();
      return Query.fromPromise(
        axios.put<T>(builder(arg), body, { ...opts, signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    }, {
      withBody() { return this; }
    });
  },

  /**
   * Generate a PATCH request at the given url
   */
  patch<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiBodyQuery<T, unknown, P> {
    const builder = $url<P>(strings, ...param);

    return Object.assign((arg: ApiUrlArg<P>, body: unknown, opts = {}) => {
      const ctrl = new AbortController();
      return Query.fromPromise(
        axios.patch<T>(builder(arg), body, { ...opts, signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    }, {
      withBody() { return this; }
    });
  },
};
