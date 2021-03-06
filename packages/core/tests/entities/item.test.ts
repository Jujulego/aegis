import {
  Entity,
  Item,
  MemoryStore,
  Query, EventListener, QueryState, StoreEventMap,
  StoreUpdateEvent,
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let store: MemoryStore;
let entity: Entity<TestEntity>;
let item: Item<TestEntity>;

const queryEventSpy = jest.fn<void, [Readonly<QueryState<TestEntity>>]>();
const updateEventSpy = jest.fn<void, [StoreUpdateEvent<TestEntity>]>();

beforeEach(() => {
  store = new MemoryStore();
  entity = new Entity('test', store, ({ id }) => id);
  item = new Item(entity, 'item');

  queryEventSpy.mockReset();
  updateEventSpy.mockReset();

  item.subscribe('query', queryEventSpy);
  item.subscribe('update', updateEventSpy);
});

// Tests
describe('Item.subscribe', () => {
  it('should subscribe to entity with key set if type is \'updated\'', () => {
    const listener: EventListener<StoreEventMap<TestEntity>, `update.${string}.${string}`> = () => undefined;
    const unsub = () => undefined;

    jest.spyOn(entity, 'subscribe').mockReturnValue(unsub);

    expect(item.subscribe('update', listener)).toBe(unsub);

    expect(entity.subscribe).toHaveBeenCalledWith(`update.${item.id}`, listener, undefined);
  });
});

describe('Item.refresh', () => {
  it('should call fetcher and emit query pending event', () => {
    const query = new Query<TestEntity>();
    const fetcher = jest.fn().mockReturnValue(query);

    item.refresh(fetcher, 'keep');

    expect(fetcher).toHaveBeenCalled();

    expect(item.query).toBe(query);

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith(
      {
        status: 'pending',
      },
      {
        type: 'query.pending',
        source: item.manager,
      }
    );
  });

  it('should transmit query update completed event, store result and emit update event', () => {
    const query = new Query<TestEntity>();
    const fetcher = jest.fn().mockReturnValue(query);

    item.refresh(fetcher, 'keep');
    queryEventSpy.mockReset();

    query.complete({ id: item.id, value: 1 });

    expect(item.isLoading).toBe(false);

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith(
      {
        status: 'completed',
        result: {
          id: item.id,
          value: 1
        }
      },
      {
        type: 'query.completed',
        source: query,
      }
    );

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'item',
        new: { id: 'item', value: 1 },
      },
      {
        type: `update.${entity.name}.item`,
        source: store,
      }
    );
  });

  it('should transmit query update error event', () => {
    const query = new Query<TestEntity>();
    const fetcher = jest.fn().mockReturnValue(query);

    item.refresh(fetcher, 'keep');
    queryEventSpy.mockReset();

    query.fail(new Error('failed !'));

    expect(item.isLoading).toBe(false);

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith(
      {
        status: 'failed',
        error: new Error('failed !')
      },
      {
        type: 'query.failed',
        source: query,
      }
    );

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('Item.data', () => {
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
    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'item',
        new: { id: 'item', value: 2 },
      },
      {
        type: `update.${entity.name}.item`,
        source: store,
      }
    );
  });

  it('should delete data in entity', () => {
    jest.spyOn(entity, 'deleteItem');

    item.data = undefined;

    expect(entity.deleteItem).toHaveBeenCalledWith('item');
  });
});

describe('Item.status', () => {
  it('should return pending if no query is running', () => {
    expect(item.isLoading).toBe(false);
  });

  it('should return query status', () => {
    const query = item.refresh(() => new Query(), 'keep');

    // - pending
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('pending');

    expect(item.isLoading).toBe(true);

    // - completed
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('completed');

    expect(item.isLoading).toBe(false);

    // - error
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('failed');

    expect(item.isLoading).toBe(false);
  });
});
