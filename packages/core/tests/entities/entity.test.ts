import {
  AegisEntity,
  AegisItem,
  AegisMemoryStore,
  AegisQuery, EntityQueryEvent,
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
const queryEventSpy = jest.fn<void, [EntityQueryEvent]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity<TestEntity>('test', store, ({ id }) => id);

  updateEventSpy.mockReset();
  queryEventSpy.mockReset();

  entity.addEventListener('update', updateEventSpy);
  entity.addEventListener('query', queryEventSpy);
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

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith(expect.any(EntityQueryEvent));
    expect(queryEventSpy).toHaveBeenCalledWith(expect.objectContaining({
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
