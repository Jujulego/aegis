import {
  Entity,
  List,
  MemoryStore,
  Query, QueryState,
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let store: MemoryStore;
let entity: Entity<TestEntity>;
let list: List<TestEntity>;

const statusEventSpy = jest.fn<void, [Readonly<QueryState<TestEntity[]>>]>();
const updateEventSpy = jest.fn<void, [TestEntity[]]>();

beforeEach(() => {
  store = new MemoryStore();
  entity = new Entity('test', store, ({ id }) => id);
  list = new List(entity, 'list');

  statusEventSpy.mockReset();
  updateEventSpy.mockReset();

  list.subscribe('status', statusEventSpy);
  list.subscribe('update', updateEventSpy);
});

// Tests
describe('new List', () => {
  it('should transmit store update event for items within result list', async () => {
    list.data = [{ id: 'item-1', value: 0 }];
    updateEventSpy.mockReset();

    entity.setItem('item-1', { id: 'item-1', value: 1 });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(
      [
        { id: 'item-1', value: 1 }
      ],
      {
        type: 'update',
        source: list,
      }
    );
  });

  it('should transmit store delete event for items within result list', async () => {
    list.data = [{ id: 'item-1', value: 0 }];
    updateEventSpy.mockReset();

    entity.deleteItem('item-1');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(
      [],
      {
        type: 'update',
        source: list,
      }
    );
  });

  it('should ignore store update event for unknown item', () => {
    entity.setItem('unknown', { id: 'unknown', value: 1 });

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('List.refresh', () => {
  it('should store query and emit query pending event', () => {
    jest.spyOn(list.manager, 'refresh');

    const query = new Query<TestEntity[]>();
    const fetcher = jest.fn().mockReturnValue(query);

    list.refresh(fetcher, 'replace');

    expect(list.query).toBe(query);
    expect(list.manager.refresh).toHaveBeenCalledWith(fetcher, 'replace');

    expect(statusEventSpy).toHaveBeenCalledTimes(1);
    expect(statusEventSpy).toHaveBeenCalledWith(
      {
        status: 'pending'
      },
      {
        type: 'status.pending',
        source: list.manager,
      }
    );
  });

  it('should store query result and emit update event', async () => {
    const query = new Query<TestEntity[]>();
    list.refresh(() => query, 'replace');

    query.complete([
      { id: 'item-1', value: 1 },
      { id: 'item-2', value: 2 },
      { id: 'item-3', value: 3 },
    ]);

    expect(list.data).toEqual([
      { id: 'item-1', value: 1 },
      { id: 'item-2', value: 2 },
      { id: 'item-3', value: 3 },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(
      [
        { id: 'item-1', value: 1 },
        { id: 'item-2', value: 2 },
        { id: 'item-3', value: 3 },
      ],
      {
        type: 'update',
        source: list,
      }
    );
  });
});

describe('List.isLoading', () => {
  it('should return pending if no query is running', () => {
    expect(list.isLoading).toBe(false);
  });

  it('should return query status', () => {
    const query = list.refresh(() => new Query(), 'replace');

    // - pending
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('pending');

    expect(list.isLoading).toBe(true);

    // - completed
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('completed');

    expect(list.isLoading).toBe(false);

    // - error
    jest.spyOn(query, 'status', 'get')
      .mockReturnValue('failed');

    expect(list.isLoading).toBe(false);
  });
});

describe('List.data', () => {
  it('should update and store list', () => {
    const data = [
      { id: 'item-1', value: 1 },
      { id: 'item-2', value: 2 },
      { id: 'item-3', value: 3 },
    ];

    list.data = data;
    expect(list.data).toBe(data);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(
      [
        { id: 'item-1', value: 1 },
        { id: 'item-2', value: 2 },
        { id: 'item-3', value: 3 },
      ],
      {
        type: 'update',
        source: list,
      }
    );
  });
});
