// Types
export type PartialKey<K extends string[]> =
  K extends []
    ? []
    : K extends [infer P, ...(infer R extends string[])]
      ? [P] | [P, ...PartialKey<R>]
      : string[];

/**
 * ComposedKeyTree index objects using a composed key.
 */
export class ComposedKeyTree<T, K extends string[] = string[]> implements Iterable<[PartialKey<K>, T]> {
  // Attributes
  private _array: [PartialKey<K>, T][] = [];

  // Statics
  static includes(a: string[], b: string[]): boolean {
    if (a.length > b.length) {
      return false;
    }

    for (let i = 0; i < b.length; ++i) {
      if (i === a.length) {
        return true;
      }

      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  static compare(a: string[], b: string[]): number {
    for (let i = 0; i < Math.max(a.length, b.length); ++i) {
      const [pa, pb] = [a[i], b[i]];

      // Premature end
      if (!pa) return -1;
      if (!pb) return 1;

      // Compare strings
      const cmp = a[i].localeCompare(b[i]);

      if (cmp !== 0) {
        return cmp;
      }
    }

    return 0;
  }

  // Methods
  private _searchOne(key: PartialKey<K>): [number, T | null] {
    let si = 0;
    let ei = this._array.length;

    while (si !== ei) {
      const mi = Math.floor((ei + si) / 2);

      if (ComposedKeyTree.includes(key, this.key(mi))) {
        return [mi, this.item(mi)];
      }

      const cmp = ComposedKeyTree.compare(this.key(mi), key);
      if (cmp === 0) {
        return [mi, this.item(mi)];
      }

      if (cmp < 0) {
        si = mi + 1;
      } else {
        ei = mi;
      }

      if (si === ei) {
        return [mi, null];
      }
    }

    return [0, null];
  }

  private* _searchAll(key: PartialKey<K>): Generator<[number, T]> {
    const [idx, obj] = this._searchOne(key);

    // obj null means not found
    if (obj === null) return;

    // Yields all objects where comparator return 0
    yield [idx, obj];

    // - before
    for (let i = idx - 1; i >= 0; --i) {
      if (ComposedKeyTree.includes(key, this.key(i))) {
        yield [i, this.item(i)];
      } else {
        break;
      }
    }

    // - after
    for (let i = idx + 1; i < this._array.length; ++i) {
      if (ComposedKeyTree.includes(key, this.key(i))) {
        yield [i, this.item(i)];
      } else {
        break;
      }
    }
  }

  // - accessing
  entry(i: number): [PartialKey<K>, T] {
    return this._array[i];
  }

  key(i: number): PartialKey<K> {
    return this._array[i][0];
  }

  item(i: number): T {
    return this._array[i][1];
  }

  /**
   * Return index where an object with given key should be inserted
   * @param key
   */
  shouldBeAt(key: PartialKey<K>): number {
    if (this._array.length === 0) return 0;

    // Search ordered index
    const [idx,] = this._searchOne(key);
    if (ComposedKeyTree.compare(this.key(idx), key) <= 0) {
      return idx + 1;
    }

    return idx;
  }

  /**
   * Return all objects matching the given key
   * @param key
   */
  search(key: PartialKey<K>): T[] {
    // Gather all results
    const res: T[] = [];

    for (const [,obj] of this._searchAll(key)) {
      res.push(obj);
    }

    return res;
  }

  // - modifying
  /**
   * Adds a new element to the tree
   * @param key
   * @param elem
   */
  insert(key: PartialKey<K>, elem: T): T {
    if (this.length === 0) {
      this._array.push([key, elem]);
    } else {
      const idx = this.shouldBeAt(key);

      this._array.splice(idx, 0, [key, elem]);
    }

    return elem;
  }

  /**
   * Removes all elements
   */
  clear(): void {
    this._array = [];
  }

  // - iterate
  *[Symbol.iterator]() {
    yield* this._array;
  }

  // Properties
  get length() {
    return this._array.length;
  }
}
