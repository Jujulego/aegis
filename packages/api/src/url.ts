import { ApiUrlArg, ApiUrlBuilder } from './types';

// Template tag
/**
 * Generates an url builder. Allow to define an url with parameters.
 * This will return a function accepting an object with the parameters as keys.
 *
 * @example
 * const builder = url`/example/${'id'}`;
 * builder({ id: '8' }) === '/example/8';
 */
export function $url<P extends string[] = []>(strings: TemplateStringsArray, ...param: P): ApiUrlBuilder<P> {
  // No parameters => just a string
  if (param.length === 0) {
    return () => strings.join('');
  }

  // Create the builder
  return (arg: ApiUrlArg<P>) => param.reduce(
    (r, p, i) => r + arg[p] + strings[i+1],
    strings[0]
  );
}
