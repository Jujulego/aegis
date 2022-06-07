import {
  AegisEntity,
  AegisItem, AegisList,
  AegisMemoryStore,
  AegisQuery, EntityItemQueryEvent, EntityListQueryEvent,
  EntityUpdateEvent,
  QueryUpdateEvent,
  StoreUpdateEvent
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let entity: AegisEntity<TestEntity>;
let store: AegisMemoryStore;

const updateEventSpy = jest.fn<void, [EntityUpdateEvent<TestEntity>]>();
const itemQueryEventSpy = jest.fn<void, [EntityItemQueryEvent<TestEntity>]>();
const listQueryEventSpy = jest.fn<void, [EntityListQueryEvent<TestEntity>]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity<TestEntity>('test', store, ({ id }) => id);

  updateEventSpy.mockReset();
  itemQueryEventSpy.mockReset();
  listQueryEventSpy.mockReset();

  entity.addEventListener('update', updateEventSpy);
  entity.addEventListener('item-query', itemQueryEventSpy);
  entity.addEventListener('list-query', listQueryEventSpy);
});

// Tests
describe('new AegisEntity', () => {
  it('should transmit store update event', () => {
    const storeEvent = new StoreUpdateEvent<TestEntity>(entity.name, 'event', { id: 'event', value: 1 });
    store.dispatchEvent(storeEvent);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(EntityUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      entity,
      storeEvent,
      id: 'event',
      newValue: { id: 'event', value: 1 },
    }));
  });

  it('should ignore store update event for other entity', () => {
    store.dispatchEvent(new StoreUpdateEvent('toto', 'event', 1));

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('AegisEntity.getItem', () => {
  it('should return a new item', () => {
    const item = entity.getItem('item');

    expect(item).toBeInstanceOf(AegisItem);
    expect(item.id).toBe('item');
    expect(item.entity).toBe(entity);
    expect(item.lastQuery).toBeUndefined();
  });
});

describe('AegisEntity.getList', () => {
  it('should return a new list', () => {
    const item = entity.getList('list');

    expect(item).toBeInstanceOf(AegisList);
    expect(item.key).toBe('list');
    expect(item.entity).toBe(entity);
    expect(item.lastQuery).toBeUndefined();
  });
});

describe('AegisEntity.queryItem', () => {
  let query: AegisQuery<TestEntity>;

  beforeEach(() => {
    query = new AegisQuery();
  });

  it('should call sender and return a new item', () => {
    const sender = jest.fn(() => query);
    const item = entity.queryItem('query', sender);

    expect(sender).toHaveBeenCalledTimes(1);
    expect(sender).toHaveBeenCalledWith('query');

    expect(item).toBeInstanceOf(AegisItem);
    expect(item.id).toBe('query');
    expect(item.entity).toBe(entity);
    expect(item.lastQuery).toBe(query);
  });

  it('should emit query event with new query', () => {
    entity.queryItem('query', () => query);

    expect(itemQueryEventSpy).toHaveBeenCalledTimes(1);
    expect(itemQueryEventSpy).toHaveBeenCalledWith(expect.any(EntityItemQueryEvent));
    expect(itemQueryEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      entity,
      id: 'query',
      query,
    }));
  });

  it('should keep reference to running request', () => {
    entity.queryItem('query', () => query);
    const item = entity.getItem('query');

    expect(item.lastQuery).toBe(query);
  });

  it('should not call sender if a query is pending', () => {
    const sender = jest.fn(() => query);

    entity.queryItem('query', () => query);
    entity.queryItem('query', sender);

    expect(sender).not.toHaveBeenCalled();
  });

  it('should store result from request & delete query reference', () => {
    jest.spyOn(store, 'set');
    entity.queryItem('query', () => query);

    // Receive result
    query.dispatchEvent(new QueryUpdateEvent({
      status: 'completed',
      data: { id: 'query', value: 1 }
    }));

    expect(store.set).toHaveBeenCalledWith('test', 'query', { id: 'query', value: 1 });

    // Check query ref
    const item = entity.getItem('query');
    expect(item.lastQuery).toBeUndefined();
  });
});

describe('AegisEntity.queryList', () => {
  let query: AegisQuery<TestEntity[]>;

  beforeEach(() => {
    query = new AegisQuery();
  });

  it('should call sender and return a new item', () => {
    const sender = jest.fn(() => query);
    const item = entity.queryList('query', sender);

    expect(sender).toHaveBeenCalledTimes(1);

    expect(item).toBeInstanceOf(AegisList);
    expect(item.key).toBe('query');
    expect(item.entity).toBe(entity);
    expect(item.lastQuery).toBe(query);
  });

  it('should emit query event with new query', () => {
    entity.queryList('query', () => query);

    expect(listQueryEventSpy).toHaveBeenCalledTimes(1);
    expect(listQueryEventSpy).toHaveBeenCalledWith(expect.any(EntityListQueryEvent));
    expect(listQueryEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      entity,
      key: 'query',
      query,
    }));
  });

  it('should keep reference to running request', () => {
    entity.queryList('query', () => query);
    const item = entity.getList('query');

    expect(item.lastQuery).toBe(query);
  });

  it('should cancel previous query and call sender', () => {
    const sender = jest.fn(() => query);
    jest.spyOn(query, 'cancel').mockImplementation();

    entity.queryList('query', sender);
    entity.queryList('query', sender);

    expect(sender).toHaveBeenCalledTimes(2);
    expect(query.cancel).toHaveBeenCalled();
  });

  it('should store result from request & delete query reference', () => {
    jest.spyOn(store, 'set');
    entity.queryList('query', () => query);

    // Receive result
    query.dispatchEvent(new QueryUpdateEvent({
      status: 'completed',
      data: [
        { id: 'item-1', value: 1 },
        { id: 'item-2', value: 2 }
      ]
    }));

    expect(store.set).toHaveBeenCalledWith('test', 'item-1', { id: 'item-1', value: 1 });
    expect(store.set).toHaveBeenCalledWith('test', 'item-2', { id: 'item-2', value: 2 });

    // Check query ref
    const item = entity.getList('query');
    expect(item.lastQuery).toBeUndefined();
  });
});

describe('Aegisentity.updateItem', () => {
  let mutation: AegisQuery<number>;

  beforeEach(() => {
    mutation = new AegisQuery();

    jest.spyOn(store, 'set');
  });

  it('should update cached item by merging it with query result', () => {
    jest.spyOn(store, 'get').mockReturnValue({ id: 'update', value: 0 });
    const merge = jest.fn((old: TestEntity, value: number) => ({ ...old, value }));

    entity.updateItem('update', mutation, merge);
    mutation.dispatchEvent(new QueryUpdateEvent({ status: 'completed', data: 1 }));

    // Check store update
    expect(store.get).toHaveBeenCalledWith('test', 'update');
    expect(merge).toHaveBeenCalledWith({ id: 'update', value: 0 }, 1);
    expect(store.set).toHaveBeenCalledWith('test', 'update', { id: 'update', value: 1 });
  });

  it('should ignore unknown item', () => {
    jest.spyOn(store, 'get').mockReturnValue(undefined);
    const merge = jest.fn((old: TestEntity, value: number) => ({ ...old, value }));

    entity.updateItem('update', mutation, merge);
    mutation.dispatchEvent(new QueryUpdateEvent({ status: 'completed', data: 1 }));

    // Check store update
    expect(store.get).toHaveBeenCalledWith('test', 'update');
    expect(merge).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });
});
