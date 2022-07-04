// Types
export type Key = string;

/**
 * Extract first element of key
 */
export type FirstOfKey<K extends Key> =
  K extends `${infer P}.${string}`
    ? P
    : K;

/**
 * Extract all elements of key expect the first one
 */
export type RestOfKey<K extends Key> =
  K extends `${infer P}.${infer R}`
    ? R
    : '';

/**
 * Partial key
 */
export type PartialKey<K extends Key> =
  K extends `${infer P}.${infer R}`
    ? P | `${P}.${PartialKey<R>}`
    : K;

/**
 * Splits string key type
 */
export type SplitKey<K extends string> =
  K extends `${infer P}.${infer R}`
    ? [P, ...SplitKey<R>]
    : [K];
