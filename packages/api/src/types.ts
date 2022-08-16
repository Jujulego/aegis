// Types
export type ApiUrlArgType = string | number;

/**
 * Builds url argument object type from string tuple type
 *
 * @example
 * const arg: ApiUrlArg<['toto', 'tata', 'tutu']> = {
 *   toto: 'example',
 *   tata: 85,
 *   tutu: 'cool ;)'
 * };
 *
 * @see $url
 */
export type ApiUrlArg<P extends string[]> =
  P extends []
    ? Record<string, never> | void
    : P extends [infer N extends string]
      ? { readonly [K in N]: ApiUrlArgType }
      : P extends [infer N extends string, ...(infer R extends string[])]
        ? { readonly [K in N]: string } & ApiUrlArg<R>
        : Record<string, ApiUrlArgType>;

export type ApiUrlBuilder<P extends string[]> = (arg: ApiUrlArg<P>) => string;
