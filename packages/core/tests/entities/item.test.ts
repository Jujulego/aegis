import {
  AegisEntity,
  AegisItem,
  AegisMemoryStore,
  AegisQuery, ItemQueryEvent,
  StoreUpdateEvent, StoreUpdateListener
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let store: AegisMemoryStore;
let entity: AegisEntity<TestEntity>;
let item: AegisItem<TestEntity>;

const queryEventSpy = jest.fn<void, [ItemQueryEvent<TestEntity>]>();
const updateEventSpy = jest.fn<void, [StoreUpdateEvent<TestEntity>]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity('test', store, ({ id }) => id);
  item = new AegisItem(entity, 'item');

  queryEventSpy.mockReset();
  updateEventSpy.mockReset();

  item.subscribe('query', queryEventSpy);
  item.subscribe('update', updateEventSpy);
});

// Tests
describe('AegisItem.subscribe', () => {
  it('should subscribe to entity with key set if type is \'updated\'', () => {
    const listener: StoreUpdateListener<TestEntity> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(entity, 'subscribe').mockReturnValue(unsub);

    expect(item.subscribe('update', listener)).toBe(unsub);

    expect(entity.subscribe).toHaveBeenCalledWith('update', listener, { key: [item.id] });
  });
});

describe('AegisItem.refresh', () => {
  it('should call fetcher and emit query pending event', () => {
    const query = new AegisQuery<TestEntity>();
    const fetcher = jest.fn().mockReturnValue(query);

    item.refresh(fetcher);

    expect(fetcher).toHaveBeenCalled();

    expect(item.query).toBe(query);

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith({
      type: 'query',
      key: ['pending'],
      source: query,
      data: {
        new: {
          status: 'pending'
        }
      }
    });
  });

  it('should transmit query update completed event, store result and emit update event', () => {
    const query = new AegisQuery<TestEntity>();
    const fetcher = jest.fn().mockReturnValue(query);

    item.refresh(fetcher);
    queryEventSpy.mockReset();

    query.store({ id: item.id, value: 1 });

    expect(item.status).toBe('completed');

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith({
      type: 'query',
      key: ['completed'],
      source: query,
      data: {
        old: {
          status: 'pending'
        },
        new: {
          status: 'completed',
          data: {
            id: item.id,
            value: 1
          }
        }
      }
    });

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith({
      type: 'update',
      key: ['test', 'item'],
      source: store,
      data: {
        id: 'item',
        new: { id: 'item', value: 1 },
      },
    });
  });

  it('should transmit query update error event', () => {
    const query = new AegisQuery<TestEntity>();
    const fetcher = jest.fn().mockReturnValue(query);

    item.refresh(fetcher);
    queryEventSpy.mockReset();

    query.error(new Error('failed !'));

    expect(item.status).toBe('error');

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith({
      type: 'query',
      key: ['error'],
      source: query,
      data: {
        old: {
          status: 'pending'
        },
        new: {
          status: 'error',
          data: new Error('failed !')
        }
      }
    });

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('AegisItem.data', () => {
  it('should read data from entity', () => {
    jest.spyOn(entity, 'getItem').mockReturnValue({
      id: item.id,
      value: 1
    });

    expect(item.data).toEqual({ id: 'item', value: 1 });
    expect(entity.getItem).toHaveBeenCalledWith('item');
  });

  it('should write data in entity and emit update event', () => {
    jest.spyOn(entity, 'setItem');

    item.data = { id: 'item', value: 2 };

    expect(entity.setItem).toHaveBeenCalledWith('item', { id: 'item', value: 2 });

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith({
      type: 'update',
      key: ['test', 'item'],
      source: store,
      data: {
        id: 'item',
        new: { id: 'item', value: 2 },
      },
    });
  });

  it('should delete data in entity', () => {
    jest.spyOn(entity, 'deleteItem');

    item.data = undefined;

    expect(entity.deleteItem).toHaveBeenCalledWith('item');
  });
});

describe('AegisItem.status', () => {
  it('should return pending if no query is running', () => {
    expect(item.status).toBe('pending');
  });

  it('should return query status', () => {
    const query = item.refresh(() => new AegisQuery());

    // - pending
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('pending');

    expect(item.status).toBe('pending');

    // - completed
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('completed');

    expect(item.status).toBe('completed');

    // - error
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('error');

    expect(item.status).toBe('error');
  });
});
