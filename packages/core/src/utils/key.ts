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
  K extends `${string}.${infer R}`
    ? R
    : '';

/**
 * Extract keys by beginning
 */
export type ExtractKey<K extends Key, S extends Key> =
  K extends `${S}.${string}`
    ? K
    : Extract<K, S>;

/**
 * Partial key
 */
export type PartialKey<K extends Key> =
  K extends `${infer P}.${infer R}`
    ? P | `${P}.${PartialKey<R>}`
    : K;
