// Types
export type ApiUrlArg<P extends string[]> =
  P extends []
    ? void
    : P extends [infer N extends string]
      ? { readonly [K in N]: string | number }
      : P extends [infer N extends string, ...(infer R extends string[])]
        ? { readonly [K in N]: string | number } & ApiUrlArg<R>
        : Record<string, string | number>;

export type ApiUrlBuilder<P extends string[]> = (arg: ApiUrlArg<P>) => string;

// Template tag
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
export function $url<P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiUrlBuilder<P> {
  // No parameters => just a string
  if (param.length === 0) {
    return () => strings.join('');
  }

  // Create the builder
  return (arg: ApiUrlArg<P>) => param.reduce(
    (r, p, i) => r + arg[p as keyof ApiUrlArg<P>] + strings[i+1],
    strings[0]
  );
}
