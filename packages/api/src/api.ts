import { Query } from '@jujulego/aegis-core';
import axios from 'axios';

import { ApiFetcher, ApiFetcherWithBody, ApiRequest, ApiUrlArg } from './types';
import { $url } from './url';

// Utils
function addBodyHelper<B, D, A>(fetcher: (arg: A, body: B) => Query<D>) {
  return Object.assign(fetcher, {
    body() {
      return this;
    }
  });
}

// Class
export class AegisApi {
  // Methods
  /**
   * Builds a http fetcher, sending the http request returned by the given builder.
   *
   * @param builder
   */
  request<B, D, A extends unknown[] = []>(builder: (...args: A) => ApiRequest<B>): (...args: A) => Query<D> {
    return (...args: A) => {
      const ctrl = new AbortController();
      const req = builder(...args);

      return Query.fromPromise(
        axios.request({ method: req.method, url: req.url, data: req.body, signal: ctrl.signal })
          .then((res) => res.data)
      );
    };
  }

  /**
   * Sends a GET http request, to the given buildable url
   *
   * @example
   * const fetcher = $api.get`/test/${'id'}`;
   * fetcher({ id: 8 }); // <= this will send a GET request to '/test/8' url
   *
   * @see $url
   */
  get<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcher<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);

    return this.request((arg) => ({ method: 'get', url: builder(arg) }));
  }

  /**
   * Sends a HEAD http request, to the given buildable url
   *
   * @example
   * const fetcher = $api.head`/test/${'id'}`;
   * fetcher({ id: 8 }); // <= this will send a HEAD request to '/test/8' url
   *
   * @see $url
   */
  head<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcher<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);

    return this.request((arg) => ({ method: 'head', url: builder(arg) }));
  }

  /**
   * Sends a OPTIONS http request, to the given buildable url
   *
   * @example
   * const fetcher = $api.options`/test/${'id'}`;
   * fetcher({ id: 8 }); // <= this will send a OPTIONS request to '/test/8' url
   *
   * @see $url
   */
  options<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcher<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);

    return this.request((arg) => ({ method: 'options', url: builder(arg) }));
  }

  /**
   * Sends a DELETE http request, to the given buildable url
   *
   * @example
   * const fetcher = $api.delete`/test/${'id'}`;
   * fetcher({ id: 8 }); // <= this will send a DELETE request to '/test/8' url
   *
   * @see $url
   */
  delete<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcher<ApiUrlArg<P>, D> {
    const builder = $url<P>(strings, ...param);

    return this.request((arg) => ({ method: 'delete', url: builder(arg) }));
  }

  /**
   * Sends a POST http request, with to given buildable url
   *
   * @example
   * const fetcher = $api.post`/test/${'id'}`
   *                     .body<string>(); // <= Allows to define body type, defaults to unknown
   *
   * fetcher({ id: 8 }, 'example'); // <= this will send a POST request to '/test/8' url, with 'example' as body
   *
   * @see $url
   */
  post<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, D> {
    const builder = $url<P>(strings, ...param);

    return addBodyHelper(
      this.request((arg, body) => ({ method: 'post', url: builder(arg), body }))
    );
  }

  /**
   * Sends a PU http request, with to given buildable url
   *
   * @example
   * const fetcher = $api.put`/test/${'id'}`
   *                     .body<string>(); // <= Allows to define body type, defaults to unknown
   *
   * fetcher({ id: 8 }, 'example'); // <= this will send a PU request to '/test/8' url, with 'example' as body
   *
   * @see $url
   */
  put<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, D> {
    const builder = $url<P>(strings, ...param);

    return addBodyHelper(
      this.request((arg, body) => ({ method: 'put', url: builder(arg), body }))
    );
  }

  /**
   * Sends a PATCH http request, with to given buildable url
   *
   * @example
   * const fetcher = $api.patch`/test/${'id'}`
   *                     .body<string>(); // <= Allows to define body type, defaults to unknown
   *
   * fetcher({ id: 8 }, 'example'); // <= this will send a PATCH request to '/test/8' url, with 'example' as body
   *
   * @see $url
   */
  patch<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, D> {
    const builder = $url<P>(strings, ...param);

    return addBodyHelper(
      this.request((arg, body) => ({ method: 'patch', url: builder(arg), body }))
    );
  }
}

export const $api = new AegisApi();
