import {
  Entity,
  Item, List,
  MemoryStore,
  Query,
  EventListener, StoreEventMap,
  StoreUpdateEvent,
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

  updateEventSpy.mockReset();

  entity.subscribe('update', updateEventSpy);
});

// Tests
describe('Entity.subscribe', () => {
  it('should subscribe to store updates with key set', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `update.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribe('update', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`update.${entity.name}`, listener, undefined);
  });

  it('should subscribe to store updates with key prepended', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `update.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribe('update.item', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`update.${entity.name}.item`, listener, undefined);
  });

  it('should subscribe to store deletes with key set', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `delete.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribe('delete', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`delete.${entity.name}`, listener, undefined);
  });

  it('should subscribe to store deletes with key prepended', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `delete.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribe('delete.item', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`delete.${entity.name}.item`, listener, undefined);
  });
});

describe('Entity.subscribeList', () => {
  it('should subscribe to store updates with key set', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `update.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribeList('update', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`update.${entity.name}-list`, listener, undefined);
  });

  it('should subscribe to store updates with key prepended', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `update.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribeList('update.list', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`update.${entity.name}-list.list`, listener, undefined);
  });

  it('should subscribe to store deletes with key set', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `delete.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribeList('delete', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`delete.${entity.name}-list`, listener, undefined);
  });

  it('should subscribe to store deletes with key prepended', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `delete.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribeList('delete.list', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`delete.${entity.name}-list.list`, listener, undefined);
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
        type: `update.${entity.name}.item`,
        source: store,
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
        type: `update.${entity.name}.update`,
        source: store
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
        type: `update.${entity.name}.update`,
        source: store,
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
