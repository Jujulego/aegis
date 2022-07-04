import { KeyTree } from '../../src';

// Setup
let tree: KeyTree<number, 'toto.tata.tutu' | 'titi'>;

beforeEach(() => {
  tree = new KeyTree();
});

// Tests
describe('KeyTree', () => {
  it('should yield element with key and parent keys', () => {
    tree.insert('toto', 1);
    tree.insert('toto.tata', 2);
    tree.insert('toto.tata.tutu', 3);
    tree.insert('titi', 4);

    expect(Array.from(tree.searchWithParent('toto.tata')))
      .toEqual([1, 2]);
  });

  it('should not return removed item', () => {
    tree.insert('toto', 1);
    tree.insert('toto.tata', 1);

    tree.remove(1);

    expect(Array.from(tree.searchWithParent('toto.tata')))
      .toEqual([]);
  });
});
