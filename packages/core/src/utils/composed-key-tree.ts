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
  static isEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }

  static *parentKeys<K extends string[]>(key: PartialKey<K>): Generator<PartialKey<K>> {
    const k: string[] = [];

    for (const p of key) {
      k.push(p);

      yield k as PartialKey<K>;
    }
  }

  /**
   * Return true if b is a's child
   * @param a
   * @param b
   */
  static isChild(a: string[], b: string[]): boolean {
    if (a.length > b.length) return false;

    for (let i = 0; i < b.length; ++i) {
      if (i === a.length) return true;
      if (a[i] !== b[i]) return false;
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
  private _searchOne(key: PartialKey<K>): number {
    let si = 0;
    let ei = this._array.length;

    while (si !== ei) {
      const mi = Math.floor((ei + si) / 2);

      const cmp = ComposedKeyTree.compare(this.key(mi), key);
      if (cmp === 0) {
        return mi;
      }

      if (cmp < 0) {
        si = mi + 1;
      } else {
        ei = mi;
      }

      if (si === ei) {
        return mi;
      }
    }

    return 0;
  }

  private* _searchAll(key: PartialKey<K>, predicate: (a: PartialKey<K>, b: PartialKey<K>) => boolean): Generator<T> {
    if (this.length === 0) return;

    // Search one item
    const idx = this._searchOne(key);

    // - before
    for (let i = idx; i >= 0; --i) {
      if (predicate(key, this.key(i))) {
        yield this.item(i);
      } else {
        break;
      }
    }

    // - after
    for (let i = idx + 1; i < this._array.length; ++i) {
      if (predicate(key, this.key(i))) {
        yield this.item(i);
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
    const idx = this._searchOne(key);
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

    for (const obj of this._searchAll(key, ComposedKeyTree.isEqual)) {
      res.push(obj);
    }

    return res;
  }

  /**
   * Return all objects matching the given key and parent keys
   * @param key
   */
  searchWithParent(key: PartialKey<K>): T[] {
    // Gather all results
    const res: T[] = [];

    for (const pk of ComposedKeyTree.parentKeys(key)) {
      for (const obj of this._searchAll(pk, ComposedKeyTree.isEqual)) {
        res.push(obj);
      }
    }

    return res;
  }

  /**
   * Return all objects matching the given key and child keys
   * @param key
   */
  searchWithChildren(key: PartialKey<K>): T[] {
    // Gather all results
    const res: T[] = [];

    for (const obj of this._searchAll(key, ComposedKeyTree.isChild)) {
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

  remove(elem: T) {
    this._array = this._array.filter(([, obj]) => obj === elem);
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
