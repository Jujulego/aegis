import {
  Entity,
  Item, List,
  MemoryStore,
  Query, StoreDeleteEvent, StoreUpdateEvent,
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let entity: Entity<TestEntity>;
let store: MemoryStore;

const updateEventSpy = jest.fn<void, [StoreUpdateEvent<TestEntity>]>();

beforeEach(() => {
  store = new MemoryStore();
  entity = new Entity<TestEntity>('test', store, ({ id }) => id);

  jest.resetAllMocks();
  jest.restoreAllMocks();
  updateEventSpy.mockReset();

  entity.subscribe('update.item', updateEventSpy);
});

// Tests
describe('Entity.subscribe', () => {
  beforeEach(() => {
    jest.spyOn(store, 'subscribe');
  });

  it('should subscribe to list & item updates with key set', () => {
    const listener = (_: StoreUpdateEvent<TestEntity> | StoreUpdateEvent<string[]>) => undefined;

    entity.subscribe('update', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`update.${entity.name}`, listener, undefined);
    expect(store.subscribe).toHaveBeenCalledWith(`update.${entity.name}-list`, listener, undefined);
  });

  it('should subscribe to item updates with key set', () => {
    const listener = (_: StoreUpdateEvent<TestEntity>) => undefined;

    entity.subscribe('update.item', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`update.${entity.name}`, listener, undefined);
  });

  it('should subscribe to item updates with key prepended', () => {
    const listener = (_: StoreUpdateEvent<TestEntity>) => undefined;

    entity.subscribe('update.item.id', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`update.${entity.name}.id`, listener, undefined);
  });

  it('should subscribe to list updates with key set', () => {
    const listener = (_: StoreUpdateEvent<string[]>) => undefined;

    entity.subscribe('update.list', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`update.${entity.name}-list`, listener, undefined);
  });

  it('should subscribe to list updates with key prepended', () => {
    const listener = (_: StoreUpdateEvent<string[]>) => undefined;

    entity.subscribe('update.list.key', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`update.${entity.name}-list.key`, listener, undefined);
  });

  it('should subscribe to list & item deletes with key set', () => {
    const listener = (_: StoreDeleteEvent<TestEntity> | StoreDeleteEvent<string[]>) => undefined;

    entity.subscribe('delete', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`delete.${entity.name}`, listener, undefined);
    expect(store.subscribe).toHaveBeenCalledWith(`delete.${entity.name}-list`, listener, undefined);
  });

  it('should subscribe to item deletes with key set', () => {
    const listener = (_: StoreDeleteEvent<TestEntity>) => undefined;

    entity.subscribe('delete.item', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`delete.${entity.name}`, listener, undefined);
  });

  it('should subscribe to item deletes with key prepended', () => {
    const listener = (_: StoreDeleteEvent<TestEntity>) => undefined;

    entity.subscribe('delete.item.id', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`delete.${entity.name}.id`, listener, undefined);
  });

  it('should subscribe to list deletes with key set', () => {
    const listener = (_: StoreDeleteEvent<string[]>) => undefined;

    entity.subscribe('delete.list', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`delete.${entity.name}-list`, listener, undefined);
  });

  it('should subscribe to store deletes with key prepended', () => {
    const listener = (_: StoreDeleteEvent<string[]>) => undefined;

    entity.subscribe('delete.list.key', listener);

    expect(store.subscribe).toHaveBeenCalledWith(`delete.${entity.name}-list.key`, listener, undefined);
  });
});

describe('Entity.item', () => {
  it('should return an Item instance', () => {
    const item = entity.item('item');

    expect(item).toBeInstanceOf(Item);
    expect(item.id).toBe('item');
    expect(item.entity).toBe(entity);
  });

  it('should return always return the same instance for the same id', () => {
    const item = entity.item('item');

    expect(entity.item('item')).toBe(item);
    expect(entity.item('toto')).not.toBe(item);
  });
});

describe('Entity.list', () => {
  it('should return an List instance', () => {
    const list = entity.list('all');

    expect(list).toBeInstanceOf(List);
    expect(list.key).toBe('all');
    expect(list.entity).toBe(entity);
  });

  it('should return always return the same instance for the same key', () => {
    const list = entity.list('all');

    expect(entity.list('all')).toBe(list);
    expect(entity.list('toto')).not.toBe(list);
  });
});

describe('Entity.query', () => {
  let query: Query<TestEntity>;

  beforeEach(() => {
    query = new Query();
  });

  it('should resolve to an item when the query completes', async () => {
    jest.spyOn(store, 'set');
    jest.spyOn(entity, 'item');

    // Register query
    const prom = entity.query(query);

    expect(prom).toBeInstanceOf(Query);

    // Query completes
    query.complete({ id: 'item', value: 1 });

    await expect(prom).resolves.toBeInstanceOf(Item);

    expect(store.set).toHaveBeenCalledWith(entity.name, 'item', { id: 'item', value: 1 });
    expect(entity.item).toHaveBeenCalledWith('item');

    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'item',
        new: { id: 'item', value: 1 }
      },
      {
        key: `update.${entity.name}.item`,
        origin: store,
      }
    );
  });
});

describe('Entity.mutation', () => {
  it('should update cached item with query result', async () => {
    const query = new Query<TestEntity>();

    jest.spyOn(store, 'set');
    store.set(entity.name, 'update', { id: 'update', value: 1 });

    // Register query
    const prom = entity.mutation('update', query);

    expect(prom).toBeInstanceOf(Query);

    // Query completes
    query.complete({ id: 'update', value: 2 });

    await expect(prom).resolves.toEqual({ id: 'update', value: 2 });

    expect(store.set).toHaveBeenCalledWith(entity.name, 'update', { id: 'update', value: 2 });

    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'update',
        old: { id: 'update', value: 1 },
        new: { id: 'update', value: 2 }
      },
      {
        key: `update.${entity.name}.update`,
        origin: store
      }
    );
  });

  it('should update cached item by merging it with query result', async () => {
    const query = new Query<number>();

    jest.spyOn(store, 'get');
    jest.spyOn(store, 'set');
    store.set(entity.name, 'update', { id: 'update', value: 1 });

    // Register query
    const prom = entity.mutation('update', query, (data, result) => ({ ...data, value: result }));

    expect(prom).toBeInstanceOf(Query);

    // Query completes
    query.complete(2);

    await expect(prom).resolves.toEqual({ id: 'update', value: 2 });

    expect(store.get).toHaveBeenCalledWith(entity.name, 'update');
    expect(store.set).toHaveBeenCalledWith(entity.name, 'update', { id: 'update', value: 2 });

    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'update',
        old: { id: 'update', value: 1 },
        new: { id: 'update', value: 2 }
      },
      {
        key: `update.${entity.name}.update`,
        origin: store,
      }
    );
  });

  it('should ignore unknown item if trying to merge it', async () => {
    const query = new Query<number>();

    jest.spyOn(store, 'get');
    jest.spyOn(store, 'set');

    // Register query
    const prom = entity.mutation('update', query, (data, result) => ({ ...data, value: result }));

    expect(prom).toBeInstanceOf(Query);

    // Query completes
    query.complete(2);

    await expect(prom).rejects.toEqual(new Error(`Unknown mutated item ${entity.name}.update`));

    expect(store.get).toHaveBeenCalledWith(entity.name, 'update');
    expect(store.set).not.toHaveBeenCalled();

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('Entity.deletion', () => {
  let query: Query<void>;

  beforeEach(() => {
    query = new Query();
  });

  it('should remove cached item when query completes', async () => {
    jest.spyOn(store, 'delete');
    store.set(entity.name, 'delete', { id: 'delete', value: 1 });

    // Register query
    const prom = entity.deletion('delete', query);

    expect(prom).toBeInstanceOf(Query);

    // Query completes
    query.complete();

    await expect(prom).resolves.toEqual({ id: 'delete', value: 1 });

    expect(store.delete).toHaveBeenCalledWith('test', 'delete');
  });
});
