import { FirstOfKey, Key, PartialKey, RestOfKey } from './key';

// Class
export class KeyTree<T, K extends Key> {
  // Attributes
  private readonly _elements = new Set<T>();
  private readonly _children = new Map<FirstOfKey<K>, KeyTree<T, RestOfKey<K>>>();

  // Methods
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

    const [part, ...rest] = key.split('.');
    const child = this._children.get(part as FirstOfKey<K>);

    if (child) {
      yield* child.searchWithParent(rest.join('.') as PartialKey<RestOfKey<K>>);
    }
  }

  insert(key: PartialKey<K>, elem: T): void {
    if (key.length === 0) {
      this._elements.add(elem);
    } else {
      const [part, ...rest] = key.split('.');

      const child = this._getChild(part as FirstOfKey<K>);
      child.insert(rest.join('.') as PartialKey<RestOfKey<K>>, elem);
    }
  }

  remove(elem: T): void {
    this._elements.delete(elem);

    for (const child of this._children.values()) {
      child.remove(elem);
    }
  }
}
