import { $entity, $store, AegisEntity, AegisItem, AegisList, AegisQuery } from '../../src';

// Types
interface TestEntity {
  id: string;
  data: boolean;
}

// Tests
describe( '$entity', () => {
  it('should create an entity aegis object', () => {
    const store = $store.memory();
    const ent = $entity<TestEntity>('test', store, ({ id }) => id);

    expect(ent.$entity).toBeInstanceOf(AegisEntity);
    expect(ent.$entity.name).toBe('test');
    expect(ent.$entity.store).toBe(store);
  });

  describe('$entity.$get', () => {
    it('should register an item query at given name', () => {
      const query = new AegisQuery<TestEntity>();
      const sender = jest.fn(() => query);

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$get('getItem', sender);

      expect(ent).toHaveProperty('getItem', expect.any(Function));

      // Call sender
      jest.spyOn(ent.$entity, 'queryItem');

      const itm = ent.getItem('item');

      expect(itm).toBeInstanceOf(AegisItem);
      expect(itm.id).toBe('item');
      expect(itm.entity).toBe(ent.$entity);
      expect(itm.lastQuery).toBe(query);

      expect(ent.$entity.queryItem).toHaveBeenCalledWith('item', sender);

      expect(sender).toHaveBeenCalledWith('item');
    });
  });

  describe('$entity.$list', () => {
    it('should register an item query at given name', () => {
      const query = new AegisQuery<TestEntity[]>();
      const sender = jest.fn((_: number) => query);

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$list('getList', sender);

      expect(ent).toHaveProperty('getList', expect.any(Function));

      // Call sender
      jest.spyOn(ent.$entity, 'queryList');

      const lst = ent.getList('test', 5);

      expect(lst).toBeInstanceOf(AegisList);
      expect(lst.key).toBe('test');
      expect(lst.entity).toBe(ent.$entity);
      expect(lst.lastQuery).toBe(query);

      expect(ent.$entity.queryList).toHaveBeenCalledWith('test', expect.any(Function));

      expect(sender).toHaveBeenCalledWith(5);
    });
  });
});
