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
      jest.spyOn(ent.$entity, 'item');

      const itm = ent.getItem({ id: 'item' });

      expect(itm).toBeInstanceOf(AegisItem);
      expect(itm.id).toBe('item');
      expect(itm.entity).toBe(ent.$entity);
      expect(itm.query).toBe(query);

      expect(ent.$entity.item).toHaveBeenCalledWith('item');

      expect(sender).toHaveBeenCalledWith({ id: 'item' });
    });
  });

  describe('$entity.$query', () => {
    it('should register a query at given name', async () => {
      const query = new AegisQuery<TestEntity>();
      const sender = jest.fn((_: number) => query);

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$query('createItem', sender);

      expect(ent).toHaveProperty('createItem', expect.any(Function));

      // Call sender
      jest.spyOn(ent.$entity, 'query');

      const prm = ent.createItem(3);

      expect(sender).toHaveBeenCalledWith(3);
      expect(ent.$entity.query).toHaveBeenCalledWith(query);

      // Item
      query.store({ id: 'query', data: true });

      await expect(prm).resolves.toBeInstanceOf(AegisItem);

      const itm = await prm;
      expect(itm.id).toBe('query');
      expect(itm.entity).toBe(ent.$entity);
    });
  });

  describe('$entity.$list', () => {
    it('should register a list query at given name', () => {
      const query = new AegisQuery<TestEntity[]>();
      const sender = jest.fn((_: number) => query);

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$list('getList', sender);

      expect(ent).toHaveProperty('getList', expect.any(Function));

      // Call sender
      jest.spyOn(ent.$entity, 'list');

      const lst = ent.getList('test', 5);

      expect(lst).toBeInstanceOf(AegisList);
      expect(lst.key).toBe('test');
      expect(lst.entity).toBe(ent.$entity);
      expect(lst.query).toBe(query);

      expect(ent.$entity.list).toHaveBeenCalledWith('test');

      expect(sender).toHaveBeenCalledWith(5);
    });
  });

  describe('$entity.$create', () => {
    it('should register a create query at given name', async () => {
      const query = new AegisQuery<TestEntity>();
      const sender = jest.fn((_: number) => query);

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$create('createItem', sender);

      expect(ent).toHaveProperty('createItem', expect.any(Function));

      // Call sender
      jest.spyOn(ent.$entity, 'query');

      const prm = ent.createItem(3);

      expect(sender).toHaveBeenCalledWith(3);
      expect(ent.$entity.query).toHaveBeenCalledWith(query);

      // Item
      query.store({ id: 'create', data: true });

      await expect(prm).resolves.toBeInstanceOf(AegisItem);

      const itm = await prm;
      expect(itm.id).toBe('create');
      expect(itm.entity).toBe(ent.$entity);
    });
  });

  describe('$entity.$update', () => {
    it('should send mutation request and update cached item with result', () => {
      const query = new AegisQuery<TestEntity>();
      const sender = jest.fn((id: string, _: number) => query);

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$update('updateItem', sender);

      expect(ent).toHaveProperty('updateItem', expect.any(Function));

      // Set item in store
      const itm = ent.$entity.item('item');
      itm.data = { id: 'item', data: false };

      // Call sender
      jest.spyOn(ent.$entity, 'mutation');

      ent.updateItem('item', 1);

      expect(sender).toHaveBeenCalledWith('item', 1);
      expect(ent.$entity.mutation).toHaveBeenCalledWith('item', query);

      // Emit result
      query.store({ id: 'item', data: true });

      expect(itm.data).toEqual({ id: 'item', data: true });
    });

    it('should send mutation request and update cached item by merging it with result', () => {
      const query = new AegisQuery<boolean>();
      const sender = jest.fn((id: string, _: number) => query);
      const merge = jest.fn((old: TestEntity, data: boolean) => ({ ...old, data }));

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$update('updateItem', sender, merge);

      expect(ent).toHaveProperty('updateItem', expect.any(Function));

      // Set item in store
      const itm = ent.$entity.item('item');
      itm.data = { id: 'item', data: false };

      expect(itm.data).toEqual({ id: 'item', data: false });

      // Call sender
      jest.spyOn(ent.$entity, 'mutation');

      ent.updateItem('item', 1);

      expect(sender).toHaveBeenCalledWith('item', 1);
      expect(ent.$entity.mutation).toHaveBeenCalledWith('item', query, merge);

      // Emit result
      query.store(true);

      expect(itm.data).toEqual({ id: 'item', data: true });
      expect(merge).toHaveBeenCalledWith({ id: 'item', data: false }, true);
    });
  });

  describe('$entity.$delete', () => {
    it('should register a delete query at given name', async () => {
      const query = new AegisQuery<void>();
      const sender = jest.fn(() => query);

      // Call builder
      const ent = $entity<TestEntity>('test', $store.memory(), ({ id }) => id)
        .$delete('deleteItem', sender);

      expect(ent).toHaveProperty('deleteItem', expect.any(Function));

      // Call sender
      jest.spyOn(ent.$entity, 'deletion');

      expect(ent.deleteItem('delete')).toBeInstanceOf(AegisQuery);

      expect(sender).toHaveBeenCalledWith('delete');
      expect(ent.$entity.deletion).toHaveBeenCalledWith('delete', query);
    });
  });
});
