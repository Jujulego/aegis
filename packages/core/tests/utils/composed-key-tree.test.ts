import { ComposedKeyTree } from '../../src';

// Tests
describe('ComposedKeyTree.isChild', () => {
  it('should be false if a is longer than b', () => {
    expect(ComposedKeyTree.isChild(['a', 'b'], ['a'])).toBe(false);
  });

  it('should be false a as different parts than b', () => {
    expect(ComposedKeyTree.isChild(['a', 'a'], ['a', 'b'])).toBe(false);
  });

  it('should be true if a is equal to b', () => {
    expect(ComposedKeyTree.isChild(['a', 'b'], ['a', 'b'])).toBe(true);
  });

  it('should be true if a is a portion of b', () => {
    expect(ComposedKeyTree.isChild(['a'], ['a', 'b'])).toBe(true);
  });
});

test('ComposedKeyTree.compare', () => {
  expect(ComposedKeyTree.compare(['a', 'b'], ['a', 'b'])).toBe(0);

  expect(ComposedKeyTree.compare(['a'], ['a', 'b'])).toBeLessThan(0);
  expect(ComposedKeyTree.compare(['a', 'b'], ['a'])).toBeGreaterThan(0);

  expect(ComposedKeyTree.compare(['b'], ['a', 'b'])).toBeGreaterThan(0);
  expect(ComposedKeyTree.compare(['a', 'b'], ['b'])).toBeLessThan(0);

  expect(ComposedKeyTree.compare(['a', 'a'], ['a', 'b'])).toBeLessThan(0);
  expect(ComposedKeyTree.compare(['a', 'a'], ['b', 'a'])).toBeLessThan(0);

  expect(ComposedKeyTree.compare(['a', 'b'], ['a', 'a'])).toBeGreaterThan(0);
  expect(ComposedKeyTree.compare(['b', 'a'], ['a', 'a'])).toBeGreaterThan(0);
});

describe('ComposedKeyTree.insert', () => {
  it('should insert new key element pair in key order', () => {
    const tree = new ComposedKeyTree<number>();

    tree.insert(['test', '2'], 2);
    tree.insert(['test'], 0);
    tree.insert(['test', '1'], 1);
    tree.insert(['test', '1', '1'], 11);

    expect(tree.entry(0)).toEqual([['test'], 0]);
    expect(tree.entry(1)).toEqual([['test', '1'], 1]);
    expect(tree.entry(2)).toEqual([['test', '1', '1'], 11]);
    expect(tree.entry(3)).toEqual([['test', '2'], 2]);
  });
});

describe('ComposedKeyTree.search', () => {
  it('should return every item matching key', () => {
    const tree = new ComposedKeyTree<number>();

    tree.insert(['test', '1'], 1);
    tree.insert(['test', '1', '1'], 11);
    tree.insert(['test', '2'], 2);

    expect(tree.search(['unknown'])).toEqual([]);
    expect(tree.search(['test'])).toEqual([]);
    expect(tree.search(['test', '1'])).toEqual([1]);
    expect(tree.search(['test', '1', '1'])).toEqual([11]);
    expect(tree.search(['test', '2'])).toEqual([2]);
  });
});

describe('ComposedKeyTree.searchWithParent', () => {
  it('should return every item matching key and child keys', () => {
    const tree = new ComposedKeyTree<number>();

    tree.insert(['test', '1'], 1);
    tree.insert(['test', '1', '1'], 11);
    tree.insert(['test', '2'], 2);

    expect(tree.searchWithParent(['unknown'])).toEqual([]);
    expect(tree.searchWithParent(['test'])).toEqual([]);
    expect(tree.searchWithParent(['test', '1'])).toEqual([1]);
    expect(tree.searchWithParent(['test', '1', '1'])).toEqual([1, 11]);
    expect(tree.searchWithParent(['test', '2'])).toEqual([2]);
  });
});

describe('ComposedKeyTree.searchWithChildren', () => {
  it('should return every item matching key and child keys', () => {
    const tree = new ComposedKeyTree<number>();

    tree.insert(['test', '1'], 1);
    tree.insert(['test', '1', '1'], 11);
    tree.insert(['test', '2'], 2);

    expect(tree.searchWithChildren(['unknown'])).toEqual([]);
    expect(tree.searchWithChildren(['test'])).toEqual([1, 11, 2]);
    expect(tree.searchWithChildren(['test', '1'])).toEqual([1, 11]);
    expect(tree.searchWithChildren(['test', '1', '1'])).toEqual([11]);
    expect(tree.searchWithChildren(['test', '2'])).toEqual([2]);
  });
});
