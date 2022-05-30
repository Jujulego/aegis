import {
  AegisEntity,
  AegisItem,
  AegisMemoryStore,
  AegisQuery, EntityQueryEvent,
  ItemUpdateEvent, QueryUpdateEvent,
  StoreUpdateEvent
} from '../../src';

// Setup
let store: AegisMemoryStore;
let entity: AegisEntity<number>;
let query: AegisQuery<number>;
let item: AegisItem<number>;

const updateEventSpy = jest.fn<void, [ItemUpdateEvent<number>]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity('test', store);
  query = new AegisQuery();
  item = new AegisItem(entity, 'item', query);

  updateEventSpy.mockReset();

  item.addEventListener('update', updateEventSpy);
});

// Tests
describe('new AegisItem', () => {
  it('should transmit store update event', () => {
    store.dispatchEvent(new StoreUpdateEvent(entity.name, item.id, 1));

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
    const query2 = new AegisQuery<number>();
    entity.dispatchEvent(new EntityQueryEvent(entity, 'item', query2));

    expect(item.lastQuery).toBe(query2);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ItemUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      item,
    }));
  });

  it('should ignore query event for other item', () => {
    const query2 = new AegisQuery<number>();
    entity.dispatchEvent(new EntityQueryEvent(entity, 'toto', query2));

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
    const query2 = new AegisQuery<number>();

    entity.dispatchEvent(new EntityQueryEvent(entity, 'item', query2));
    query2.dispatchEvent(new QueryUpdateEvent({ status: 'pending' }));

    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ItemUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      item,
    }));
  });
});

test('AegisItem.data', () => {
  jest.spyOn(store, 'get').mockReturnValue(1);

  expect(item.data).toBe(1);
  expect(store.get).toHaveBeenCalledWith('test', 'item');
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
