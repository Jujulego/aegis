// Types
export type KeyPart = string | number;
export type Key = KeyPart[];

/**
 * Extract first element of key
 */
export type FirstOfKey<K extends Key> =
  K extends []
    ? never
    : K extends [infer P extends KeyPart, ...KeyPart[]]
      ? P
      : KeyPart;

/**
 * Extract all elements of key expect the first one
 */
export type RestOfKey<K extends Key> =
  K extends []
    ? []
    : K extends [KeyPart, ...(infer R extends KeyPart[])]
      ? R
      : KeyPart[];

/**
 * Partial key
 */
export type PartialKey<K extends Key> =
  K extends []
    ? []
    : K extends [infer P extends KeyPart, ...(infer R extends KeyPart[])]
      ? [P] | [P, ...PartialKey<R>]
      : KeyPart[];

/**
 * Key type as string
 */
export type StringKey<K extends Key> =
  K extends []
    ? ''
    : K extends [infer P extends KeyPart]
      ? `${P}`
      : K extends [infer P extends KeyPart, ...(infer R extends KeyPart[])]
        ? `${P}.${StringKey<R>}`
        : string;
