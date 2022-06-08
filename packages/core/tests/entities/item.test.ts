import {
  AegisEntity,
  AegisItem,
  AegisMemoryStore,
  AegisQuery, EntityItemQueryEvent,
  ItemUpdateEvent, QueryUpdateEvent,
  StoreUpdateEvent
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let store: AegisMemoryStore;
let entity: AegisEntity<TestEntity>;
let query: AegisQuery<TestEntity>;
let item: AegisItem<TestEntity>;

const updateEventSpy = jest.fn<void, [ItemUpdateEvent<TestEntity>]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity('test', store, ({ id }) => id);
  query = new AegisQuery();
  item = new AegisItem(entity, 'item', query);

  updateEventSpy.mockReset();

  item.addEventListener('update', updateEventSpy);
});

// Tests
describe('new AegisItem', () => {
  it('should transmit store update event', () => {
    store.dispatchEvent(new StoreUpdateEvent(entity.name, item.id, { id: item.id, value: 1 }));

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ItemUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      item,
    }));
  });

  it('should ignore store update event for other item', () => {
    store.dispatchEvent(new StoreUpdateEvent(entity.name, 'toto', 1));

    expect(updateEventSpy).not.toHaveBeenCalled();
  });

  it('should transmit entity query event', () => {
    const query2 = new AegisQuery<TestEntity>();
    entity.dispatchEvent(new EntityItemQueryEvent(entity, 'item', query2));

    expect(item.lastQuery).toBe(query2);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ItemUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      item,
    }));
  });

  it('should ignore query event for other item', () => {
    const query2 = new AegisQuery<TestEntity>();
    entity.dispatchEvent(new EntityItemQueryEvent(entity, 'toto', query2));

    expect(item.lastQuery).toBe(query);

    expect(updateEventSpy).not.toHaveBeenCalled();
  });

  it('should transmit query update event', () => {
    query.dispatchEvent(new QueryUpdateEvent({ status: 'pending' }));

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ItemUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      item,
    }));
  });

  it('should transmit query update event (from updated query)', () => {
    const query2 = new AegisQuery<TestEntity>();

    entity.dispatchEvent(new EntityItemQueryEvent(entity, 'item', query2));
    query2.dispatchEvent(new QueryUpdateEvent({ status: 'pending' }));

    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ItemUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      item,
    }));
  });
});

describe('AegisItem.data', () => {
  it('should read data from store', () => {
    jest.spyOn(store, 'get').mockReturnValue(1);

    expect(item.data).toBe(1);
    expect(store.get).toHaveBeenCalledWith('test', 'item');
  });

  it('should write data in store and emit update event', () => {
    jest.spyOn(store, 'set');

    item.data = { id: 'item', value: 2 };

    expect(store.set).toHaveBeenCalledWith('test', 'item', { id: 'item', value: 2 });

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ItemUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      item,
    }));
  });
});

describe('AegisItem.isPending', () => {
  it('should return true if query is pending', () => {
    expect(item.isPending).toBe(true);
  });

  it('should return true if query is completed', () => {
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('completed');

    expect(item.isPending).toBe(false);
  });

  it('should return true if query is error', () => {
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('error');

    expect(item.isPending).toBe(false);
  });
});

test('AegisItem.lastQuery', () => {
  expect(item.lastQuery).toBe(query);
});

test('AegisItem.lastError', () => {
  const error = new Error();

  jest.spyOn(query, 'state', 'get')
    .mockReturnValue({
      status: 'error',
      data: error,
    });

  expect(item.lastError).toBe(error);
});
