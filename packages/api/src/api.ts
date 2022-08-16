import { $queryfy, Query } from '@jujulego/aegis';

import { ApiFetcher, ApiFetcherNoBody, ApiFetcherWithBody, ApiRequest, ApiRequestBuilder, ApiUrlArg } from './types';
import { $url } from './url';

// Utils
function wrapRequestBuilder<B, O>(ret: ApiRequest<B> | [ApiRequest<B>, O]): [ApiRequest<B>, O | undefined] {
  return Array.isArray(ret) ? ret : [ret, undefined];
}

function addBodyHelper<A, B, O, D>(fetcher: (arg: A, body: B, opts?: O) => Query<D>) {
  return Object.assign(fetcher, {
    body() {
      return this;
    }
  });
}

// Class
export class AegisApi<O> {
  // Constructor
  constructor(
    private readonly fetcher: ApiFetcher<O>,
  ) {}

  // Methods
  /**
   * Builds a http fetcher, sending the http request returned by the given builder.
   *
   * @param builder
   */
  request<B, D, A extends unknown[] = []>(builder: ApiRequestBuilder<A, B, O>): (...args: A) => Query<D> {
    return (...args: A) => {
      const ctrl = new AbortController();
      const [req, opts] = wrapRequestBuilder(builder(...args));

      return $queryfy<D>(this.fetcher(req, ctrl.signal, opts));
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
  get<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, O, D> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts) => {
      const controller = new AbortController();

      return $queryfy<D>(
        this.fetcher({ method: 'get', url: builder(arg) }, controller.signal, opts),
        controller
      );
    };
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
  head<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, O, D> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts) => {
      const controller = new AbortController();

      return $queryfy<D>(
        this.fetcher({ method: 'head', url: builder(arg) }, controller.signal, opts),
        controller
      );
    };
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
  options<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, O, D> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts) => {
      const controller = new AbortController();

      return $queryfy<D>(
        this.fetcher({ method: 'options', url: builder(arg) }, controller.signal, opts),
        controller
      );
    };
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
  delete<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherNoBody<ApiUrlArg<P>, O, D> {
    const builder = $url<P>(strings, ...param);

    return (arg, opts) => {
      const controller = new AbortController();

      return $queryfy<D>(
        this.fetcher({ method: 'delete', url: builder(arg) }, controller.signal, opts),
        controller
      );
    };
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
  post<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, O, D> {
    const builder = $url<P>(strings, ...param);

    return addBodyHelper((arg, body, opts) => {
      const controller = new AbortController();

      return $queryfy<D>(
        this.fetcher({ method: 'post', url: builder(arg), body }, controller.signal, opts),
        controller
      );
    });
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
  put<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, O, D> {
    const builder = $url<P>(strings, ...param);

    return addBodyHelper((arg, body, opts) => {
      const controller = new AbortController();

      return $queryfy<D>(
        this.fetcher({ method: 'put', url: builder(arg), body }, controller.signal, opts),
        controller
      );
    });
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
  patch<D, P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiFetcherWithBody<ApiUrlArg<P>, unknown, O, D> {
    const builder = $url<P>(strings, ...param);

    return addBodyHelper(((arg, body, opts) => {
      const controller = new AbortController();

      return $queryfy<D>(
        this.fetcher({ method: 'patch', url: builder(arg), body }, controller.signal, opts),
        controller
      );
    }));
  }
}

// Constants
/**
 * AegisApi instance using fetch API
 */
export const $api = new AegisApi(
  async (req, signal, opts?: Omit<RequestInit, 'method' | 'url' | 'body' | 'signal'>) => {
    // Headers
    const headers = new Headers(opts?.headers);
    headers.set('Content-Type', 'application/json; charset=utf-8');

    // Send request
    const res = await fetch(req.url, {
      ...opts,
      method: req.method,
      headers,
      body: JSON.stringify(req.body),
      signal
    });

    return res.json();
  }
);
