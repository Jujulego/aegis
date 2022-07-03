import {
  AegisEntity,
  AegisList,
  AegisMemoryStore,
  AegisQuery, QueryState,
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let store: AegisMemoryStore;
let entity: AegisEntity<TestEntity>;
let list: AegisList<TestEntity>;

const queryEventSpy = jest.fn<void, [Readonly<QueryState<TestEntity[]>>]>();
const updateEventSpy = jest.fn<void, [TestEntity[]]>();

beforeEach(() => {
  store = new AegisMemoryStore();
  entity = new AegisEntity('test', store, ({ id }) => id);
  list = new AegisList(entity, 'list');

  queryEventSpy.mockReset();
  updateEventSpy.mockReset();

  list.subscribe('query', queryEventSpy);
  list.subscribe('update', updateEventSpy);
});

// Tests
describe('new AegisList', () => {
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
        filters: [],
        source: list,
      }
    );
  });

  it('should ignore store update event for unknown item', () => {
    entity.setItem('unknown', { id: 'unknown', value: 1 });

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('AegisList.refresh', () => {
  it('should store query and emit query pending event', () => {
    const query = new AegisQuery<TestEntity[]>();
    list.refresh(() => query, 'replace');

    expect(list.query).toBe(query);

    expect(queryEventSpy).toHaveBeenCalledTimes(1);
    expect(queryEventSpy).toHaveBeenCalledWith(
      {
        status: 'pending'
      },
      {
        type: 'query',
        filters: ['pending'],
        source: list.manager,
      }
    );
  });
});

describe('AegisList.isLoading', () => {
  it('should return pending if no query is running', () => {
    expect(list.isLoading).toBe(false);
  });

  it('should return query status', () => {
    const query = list.refresh(() => new AegisQuery(), 'replace');

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

