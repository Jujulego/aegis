import { AsyncReadable, MutableRef } from '../defs/index.js';

// Types
export type MapFn<K, D, R extends MutableRef<D>> = (key: K, value: D) => R;

export type RefMapValueItem<D, R extends MutableRef> = R extends AsyncReadable ? Promise<D> : D;
export type RefMapValueIterable<D, R extends MutableRef> =
  & IterableIterator<RefMapValueItem<D, R>>
  & AsyncIterable<D>;

export type RefMapEntryItem<K, D, R extends MutableRef> = R extends AsyncReadable ? [K, Promise<D>] : [K, D];
export type RefMapEntryIterable<K, D, R extends MutableRef> =
  & IterableIterator<RefMapEntryItem<K, D, R>>
  & AsyncIterable<[K, D]>;

/**
 * Map storing data using mutable references.
 */
export class RefMap<K, D, R extends MutableRef<D>> {
  // Attributes
  private readonly _builder: MapFn<K, D, R>;
  private readonly _references = new Map<K, R>();

  // Constructor
  constructor(builder: MapFn<K, D, R>) {
    this._builder = builder;
  }

  // Methods
  get(key: K): R | undefined {
    return this._references.get(key);
  }

  has(key: K): boolean {
    return this._references.has(key);
  }

  set(key: K, value: D): R {
    let ref = this._references.get(key);

    if (!ref) {
      ref = this._builder(key, value);
      this._references.set(key, ref);
    } else {
      ref.mutate(value);
    }

    return ref;
  }

  delete(key: K): boolean {
    return this._references.delete(key);
  }

  clear(): void {
    return this._references.clear();
  }

  keys() {
    return this._references.keys();
  }

  references() {
    return this._references.values();
  }

  values(): RefMapValueIterable<D, R> {
    const refs = this._references.values();
    
    return {
      next() {
        const next = refs.next();

        return next.done ? next : {
          done: false,
          value: next.value.read() as RefMapValueItem<D, R>,
        };
      },
      [Symbol.asyncIterator]: () => ({
        async next() {
          const next = refs.next();

          return next.done ? next : {
            done: false,
            value: await next.value.read(),
          };
        },
      }),
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  entries(): RefMapEntryIterable<K, D, R> {
    const refs = this._references.entries();

    return {
      next() {
        const next = refs.next();

        return next.done ? next : {
          done: false,
          value: [next.value[0], next.value[1].read()] as RefMapEntryItem<K, D, R>,
        };
      },
      [Symbol.asyncIterator]: () => ({
        async next() {
          const next = refs.next();

          return next.done ? next : {
            done: false,
            value: [next.value[0], await next.value[1].read()],
          };
        },
      }),
      [Symbol.iterator]() {
        return this;
      },
    };
  }

  // Properties
  get size(): number {
    return this._references.size;
  }
}
