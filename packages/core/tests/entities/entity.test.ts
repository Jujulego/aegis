import {
  AegisEntity,
  AegisItem, AegisList,
  AegisMemoryStore,
  AegisQuery,
  EventListener, StoreEventMap,
  StoreUpdateEvent,
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let entity: AegisEntity<TestEntity>;
let store: AegisMemoryStore;

const updateEventSpy = jest.fn<void, [StoreUpdateEvent<TestEntity>]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity<TestEntity>('test', store, ({ id }) => id);

  updateEventSpy.mockReset();

  entity.subscribe('update', updateEventSpy);
});

// Tests
describe('AegisEntity.subscribe', () => {
  it('should subscribe to store with key set', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, 'update'> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribe('update', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`update.${entity.name}`, listener, undefined);
  });

  it('should subscribe to store with key prepended', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, 'update'> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(store, 'subscribe').mockReturnValue(unsub);

    expect(entity.subscribe('update.item', listener)).toBe(unsub);

    expect(store.subscribe).toHaveBeenLastCalledWith(`update.${entity.name}.item`, listener, undefined);
  });
});

describe('AegisEntity.item', () => {
  it('should return an AegisItem instance', () => {
    const item = entity.item('item');

    expect(item).toBeInstanceOf(AegisItem);
    expect(item.id).toBe('item');
    expect(item.entity).toBe(entity);
  });

  it('should return always return the same instance for the same id', () => {
    const item = entity.item('item');

    expect(entity.item('item')).toBe(item);
    expect(entity.item('toto')).not.toBe(item);
  });
});

describe('AegisEntity.list', () => {
  it('should return an AegisList instance', () => {
    const list = entity.list('all');

    expect(list).toBeInstanceOf(AegisList);
    expect(list.key).toBe('all');
    expect(list.entity).toBe(entity);
  });

  it('should return always return the same instance for the same key', () => {
    const list = entity.list('all');

    expect(entity.list('all')).toBe(list);
    expect(entity.list('toto')).not.toBe(list);
  });
});

describe('AegisEntity.query', () => {
  let query: AegisQuery<TestEntity>;

  beforeEach(() => {
    query = new AegisQuery();
  });

  it('should resolve to an item when the query completes', async () => {
    jest.spyOn(store, 'set');
    jest.spyOn(entity, 'item');

    // Register query
    const prom = entity.query(query);

    expect(prom).toBeInstanceOf(AegisQuery);

    // Query completes
    query.store({ id: 'item', value: 1 });

    await expect(prom).resolves.toBeInstanceOf(AegisItem);

    expect(store.set).toHaveBeenCalledWith(entity.name, 'item', { id: 'item', value: 1 });
    expect(entity.item).toHaveBeenCalledWith('item');

    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'item',
        new: { id: 'item', value: 1 }
      },
      {
        type: 'update',
        filters: [entity.name, 'item'],
        source: store,
      }
    );
  });
});

describe('AegisEntity.mutation', () => {
  it('should update cached item with query result', async () => {
    const query = new AegisQuery<TestEntity>();

    jest.spyOn(store, 'set');
    store.set(entity.name, 'update', { id: 'update', value: 1 });

    // Register query
    const prom = entity.mutation('update', query);

    expect(prom).toBeInstanceOf(AegisQuery);

    // Query completes
    query.store({ id: 'update', value: 2 });

    await expect(prom).resolves.toEqual({ id: 'update', value: 2 });

    expect(store.set).toHaveBeenCalledWith(entity.name, 'update', { id: 'update', value: 2 });

    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'update',
        old: { id: 'update', value: 1 },
        new: { id: 'update', value: 2 }
      },
      {
        type: 'update',
        filters: [entity.name, 'update'],
        source: store
      }
    );
  });

  it('should update cached item by merging it with query result', async () => {
    const query = new AegisQuery<number>();

    jest.spyOn(store, 'get');
    jest.spyOn(store, 'set');
    store.set(entity.name, 'update', { id: 'update', value: 1 });

    // Register query
    const prom = entity.mutation('update', query, (data, result) => ({ ...data, value: result }));

    expect(prom).toBeInstanceOf(AegisQuery);

    // Query completes
    query.store(2);

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
        type: 'update',
        filters: [entity.name, 'update'],
        source: store,
      }
    );
  });

  it('should ignore unknown item if trying to merge it', async () => {
    const query = new AegisQuery<number>();

    jest.spyOn(store, 'get');
    jest.spyOn(store, 'set');

    // Register query
    const prom = entity.mutation('update', query, (data, result) => ({ ...data, value: result }));

    expect(prom).toBeInstanceOf(AegisQuery);

    // Query completes
    query.store(2);

    await expect(prom).rejects.toEqual(new Error(`Unknown mutated item ${entity.name}.update`));

    expect(store.get).toHaveBeenCalledWith(entity.name, 'update');
    expect(store.set).not.toHaveBeenCalled();

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('AegisEntity.deletion', () => {
  let query: AegisQuery<void>;

  beforeEach(() => {
    query = new AegisQuery();
  });

  it('should remove cached item when query completes', async () => {
    jest.spyOn(store, 'delete');
    store.set(entity.name, 'delete', { id: 'delete', value: 1 });

    // Register query
    const prom = entity.deletion('delete', query);

    expect(prom).toBeInstanceOf(AegisQuery);

    // Query completes
    query.store();

    await expect(prom).resolves.toEqual({ id: 'delete', value: 1 });

    expect(store.delete).toHaveBeenCalledWith('test', 'delete');
  });
});
