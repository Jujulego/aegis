import {
  AegisEntity,
  AegisList,
  AegisMemoryStore,
  AegisQuery, EntityListQueryEvent,
  ListUpdateEvent, QueryUpdateEvent,
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
let query: AegisQuery<TestEntity[]>;
let list: AegisList<TestEntity>;

const updateEventSpy = jest.fn<void, [ListUpdateEvent<TestEntity>]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity('test', store, ({ id }) => id);
  query = new AegisQuery();
  list = new AegisList(entity, 'list', ({ id }) => id, query);

  updateEventSpy.mockReset();

  list.addEventListener('update', updateEventSpy);
});

// Tests
describe('new AegisList', () => {
  it('should transmit store update event for items within result list', () => {
    query.dispatchEvent(new QueryUpdateEvent({ status: 'completed', data: [{ id: 'item-1', value: 0 }] }));
    store.dispatchEvent(new StoreUpdateEvent(entity.name, 'item-1', { id: 'item-1', value: 1 }));

    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ListUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      list,
    }));
  });

  it('should ignore store update event for unknown item', () => {
    store.dispatchEvent(new StoreUpdateEvent(entity.name, 'toto', 1));

    expect(updateEventSpy).not.toHaveBeenCalled();
  });

  it('should transmit entity query event', () => {
    const query2 = new AegisQuery<TestEntity[]>();
    entity.dispatchEvent(new EntityListQueryEvent(entity, list.key, query2));

    expect(list.lastQuery).toBe(query2);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ListUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      list,
    }));
  });

  it('should ignore query event for other item', () => {
    const query2 = new AegisQuery<TestEntity[]>();
    entity.dispatchEvent(new EntityListQueryEvent(entity, 'toto', query2));

    expect(list.lastQuery).toBe(query);

    expect(updateEventSpy).not.toHaveBeenCalled();
  });

  it('should transmit query update event', () => {
    query.dispatchEvent(new QueryUpdateEvent({ status: 'pending' }));

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ListUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      list,
    }));
  });

  it('should transmit query update event (from updated query)', () => {
    const query2 = new AegisQuery<TestEntity[]>();

    entity.dispatchEvent(new EntityListQueryEvent(entity, list.key, query2));
    query2.dispatchEvent(new QueryUpdateEvent({ status: 'pending' }));

    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ListUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      list,
    }));
  });
});

describe('AegisList.data', () => {
  beforeEach(() => {
    jest.spyOn(store, 'get')
      .mockImplementation((_, id) => ({ id, value: 1 }));
  });

  it('should return empty array by default', () => {
    expect(list.data).toStrictEqual([]);
    expect(store.get).not.toHaveBeenCalled();
  });

  it('should return array built from store', () => {
    query.dispatchEvent(new QueryUpdateEvent({ status: 'completed', data: [{ id: 'item-1', value: 0 }] }));

    expect(list.data).toStrictEqual([
      { id: 'item-1', value: 1 },
    ]);
    expect(store.get).toHaveBeenCalledWith(entity.name, 'item-1');
  });

  it('should insert array items in store', () => {
    jest.spyOn(store, 'set');

    list.data = [
      { id: 'item-1', value: 1 },
      { id: 'item-3', value: 3 },
    ];

    expect(store.set).toHaveBeenCalledWith(entity.name, 'item-1', { id: 'item-1', value: 1 });
    expect(store.set).toHaveBeenCalledWith(entity.name, 'item-3', { id: 'item-3', value: 3 });

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ListUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      list,
    }));
  });
});

describe('AegisList.isPending', () => {
  it('should return true if query is pending', () => {
    expect(list.isPending).toBe(true);
  });

  it('should return true if query is completed', () => {
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('completed');

    expect(list.isPending).toBe(false);
  });

  it('should return true if query is error', () => {
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('error');

    expect(list.isPending).toBe(false);
  });
});

test('AegisList.lastQuery', () => {
  expect(list.lastQuery).toBe(query);
});

test('AegisList.lastError', () => {
  const error = new Error();

  jest.spyOn(query, 'state', 'get')
    .mockReturnValue({
      status: 'error',
      data: error,
    });

  expect(list.lastError).toBe(error);
});
