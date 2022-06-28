import { AegisQuery } from '@jujulego/aegis-core';
import axios from 'axios';

import { $url, ApiUrlArg } from './url';

// Types
export type ApiQuery<T, P extends string[]> = (arg: ApiUrlArg<P>) => AegisQuery<T>;

// Builder
export const $api = {
  get<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiQuery<T, P> {
    const builder = $url<P>(strings, ...param);

    return (arg) => {
      const ctrl = new AbortController();
      return AegisQuery.fromPromise(
        axios.get<T>(builder(arg), { signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    };
  },
  head<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiQuery<T, P> {
    const builder = $url<P>(strings, ...param);

    return (arg) => {
      const ctrl = new AbortController();
      return AegisQuery.fromPromise(
        axios.head<T>(builder(arg), { signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    };
  },
  options<T, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiQuery<T, P> {
    const builder = $url<P>(strings, ...param);

    return (arg) => {
      const ctrl = new AbortController();
      return AegisQuery.fromPromise(
        axios.options<T>(builder(arg), { signal: ctrl.signal })
          .then((res) => res.data),
        ctrl
      );
    };
  },
};
