// Types
type StringArray<T extends string, R extends string[]> = [T, ...R];

export type ApiUrlArg<P extends string[]> = P extends StringArray<infer N, infer R>
  ? { readonly [K in N]: string | number } & ApiUrlArg<R>
  : P extends []
    ? unknown
    : never;

export type ApiUrl<A> = A extends void ? string : ApiUrlBuilder<A>;
export type ApiUrlBuilder<A> = (arg: A) => string;

// Template tag
/**
 * Generates an url builder.
 * This will return the string as it was given.
 *
 * @example
 * url`/example/` === '/example/';
 *
 * @see useApi
 * @see useApiUrl
 */
export function $url(strings: TemplateStringsArray): string;

/**
 * Generates an url builder. Allow to define an url with parameters.
 * This will return a function accepting an object with the parameters as keys.
 *
 * @example
 * const builder = url`/example/${'id'}`;
 * builder({ id: 8 }) === '/example/8';
 *
 * @see useApi
 * @see useApiUrl
 */
export function $url<P extends string[]>(strings: TemplateStringsArray, ...param: P): ApiUrlBuilder<ApiUrlArg<P>>;

export function $url<P extends string[]>(strings: TemplateStringsArray, ...param: P) {
  // No parameters => just a string
  if (param.length === 0) {
    return strings.join('');
  }

  // Create the builder
  return (arg: ApiUrlArg<P>) => param.reduce(
    (r, p, i) => r + arg[p as keyof ApiUrlArg<P>] + strings[i+1],
    strings[0]
  );
}

// Utils
/**
 * Returns an url builder for every form of ApiUrl (string or 1-arg function)
 *
 * @param url
 *
 * @see useApiUrl
 */
export function urlBuilder<A = void>(url: ApiUrl<A>): ApiUrlBuilder<A> {
  return typeof url === 'string' ? () => url : url;
}
