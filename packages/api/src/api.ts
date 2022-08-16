import { Query } from '@jujulego/aegis-core';
import axios from 'axios';

import {
  ApiFetcherNoBody,
  ApiFetcherWithBody,
  ApiRequest,
  ApiRequestNoBody,
  ApiRequestWithBody,
  ApiUrlArg
} from './types';
import { $url } from './url';

// Class
export class AegisApi {
  // Methods
  request<A, D>(builder: (arg: A) => ApiRequestNoBody, body?: false): ApiFetcherNoBody<A, D>;
  request<A, B, D>(builder: (arg: A, body: B) => ApiRequestWithBody<B>, body: true): ApiFetcherWithBody<A, B, D>;
  request(builder: (...args: unknown[]) => ApiRequest<unknown>, body = false) {
    const fetcher = (...args: unknown[]) => {
      const ctrl = new AbortController();
      const req = builder(...args);

      return Query.fromPromise(
        axios.request({ method: req.method, url: req.url, data: req.body, signal: ctrl.signal })
          .then((res) => res.data)
      );
    };

    if (body) {
      return Object.assign(fetcher, {
        body() {
          return this;
        }
      });
    }

    return fetcher;
  }

  get<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);
    return this.request((arg) => ({ method: 'get', url: builder(arg) }));
  }

  head<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);
    return this.request((arg) => ({ method: 'head', url: builder(arg) }));
  }

  options<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);
    return this.request((arg) => ({ method: 'options', url: builder(arg) }));
  }

  delete<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);
    return this.request((arg) => ({ method: 'delete', url: builder(arg) }));
  }

  post<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, D> {
    const builder = $url<P>(strings, ...param);
    return this.request((arg, body) => ({ method: 'post', url: builder(arg), body }), true);
  }

  put<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, D> {
    const builder = $url<P>(strings, ...param);
    return this.request((arg, body) => ({ method: 'put', url: builder(arg), body }), true);
  }

  patch<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, D> {
    const builder = $url<P>(strings, ...param);
    return this.request((arg, body) => ({ method: 'patch', url: builder(arg), body }), true);
  }
}

export const $api = new AegisApi();
