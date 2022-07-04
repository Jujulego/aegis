import { FirstOfKey, Key, PartialKey, RestOfKey } from './key';

// Class
export class KeyTree<T, K extends Key> {
  // Attributes
  private readonly _elements = new Set<T>();
  private readonly _children = new Map<FirstOfKey<K>, KeyTree<T, RestOfKey<K>>>();

  // Methods
  private _splitKey(key: PartialKey<K>): [FirstOfKey<K>, PartialKey<RestOfKey<K>>] {
    const idx = key.indexOf('.');

    if (idx === -1) {
      return [
        key as string as FirstOfKey<K>,
        '' as PartialKey<RestOfKey<K>>
      ];
    }

    return [
      key.substring(0, idx) as FirstOfKey<K>,
      key.substring(idx + 1) as PartialKey<RestOfKey<K>>
    ];
  }

  private _getChild(part: FirstOfKey<K>): KeyTree<T, RestOfKey<K>> {
    let child = this._children.get(part);

    if (!child) {
      child = new KeyTree();
      this._children.set(part, child);
    }

    return child;
  }

  *searchWithParent(key: PartialKey<K>): Generator<T> {
    for (const elem of this._elements) {
      yield elem;
    }

    const [part, rest] = this._splitKey(key);
    const child = this._children.get(part);

    if (child) {
      yield* child.searchWithParent(rest);
    }
  }

  insert(key: PartialKey<K>, elem: T): void {
    if (key.length === 0) {
      this._elements.add(elem);
    } else {
      const [part, rest] = this._splitKey(key);

      const child = this._getChild(part);
      child.insert(rest, elem);
    }
  }

  remove(elem: T): void {
    this._elements.delete(elem);

    for (const child of this._children.values()) {
      child.remove(elem);
    }
  }
}
