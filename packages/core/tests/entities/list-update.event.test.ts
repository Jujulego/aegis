import {
  AegisEntity,
  AegisList,
  AegisMemoryStore,
  AegisQuery,
  ListUpdateEvent
} from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let list: AegisList<TestEntity>;
let event: ListUpdateEvent;

beforeEach(() => {
  const store = new AegisMemoryStore();
  const entity = new AegisEntity<TestEntity>('test', store, ({ id }) => id);
  const query = new AegisQuery<TestEntity[]>();

  list = new AegisList(entity, 'event', ({ id }) => id, query);
  event = new ListUpdateEvent(list);
});

// Tests
test('ListUpdateEvent.entity', () => {
  expect(event.entity).toBe(list.entity);
});

test('ListUpdateEvent.id', () => {
  expect(event.key).toBe('event');
});

test('ListUpdateEvent.data', () => {
  jest.spyOn(list, 'data', 'get')
    .mockReturnValue([{ id: 'item-1', value: 1 }]);

  expect(event.data).toEqual([{ id: 'item-1', value: 1 }]);
});

test('ListUpdateEvent.isPending', () => {
  jest.spyOn(list, 'isPending', 'get')
    .mockReturnValue(true);

  expect(event.isPending).toBe(true);
});

test('ListUpdateEvent.lastQuery', () => {
  expect(event.lastQuery).toBe(list.lastQuery);
});

test('ListUpdateEvent.lastError', () => {
  const error = new Error();

  jest.spyOn(list, 'lastError', 'get')
    .mockReturnValue(error);

  expect(event.lastError).toBe(error);
});
