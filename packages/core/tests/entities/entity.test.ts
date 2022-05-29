import {
  AegisEntity,
  AegisItem,
  AegisMemoryStore,
  AegisQuery,
  EntityUpdateEvent,
  QueryUpdateEvent,
  StoreUpdateEvent
} from '../../src';

// Setup
let entity: AegisEntity<number>;
let store: AegisMemoryStore;
const updateEventSpy = jest.fn<void, [EntityUpdateEvent<number>]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity('test', store);

  updateEventSpy.mockReset();
  entity.addEventListener('update', updateEventSpy);
});

// Tests
describe('new AegisEntity', () => {
  it('should transmit store update event', () => {
    const storeEvent = new StoreUpdateEvent(entity.name, 'event', 1);
    store.dispatchEvent(storeEvent);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(EntityUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      entity,
      storeEvent,
      id: 'event',
      newValue: 1,
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
  let query: AegisQuery<number>;

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
      data: 1
    }));

    expect(store.set).toHaveBeenCalledWith('test', 'query', 1);

    // Check query ref
    const item = entity.getItem('query');
    expect(item.lastQuery).toBeUndefined();
  });
});
