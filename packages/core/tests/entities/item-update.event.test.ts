import { AegisEntity, AegisItem, AegisMemoryStore, AegisQuery, ItemUpdateEvent } from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let item: AegisItem<TestEntity>;
let event: ItemUpdateEvent;

beforeEach(() => {
  const store = new AegisMemoryStore();
  const entity = new AegisEntity<TestEntity>('test', store, ({ id }) => id);
  const query = new AegisQuery<TestEntity>();

  item = new AegisItem(entity, 'event', query);
  event = new ItemUpdateEvent(item);
});

// Tests
test('ItemUpdateEvent.entity', () => {
  expect(event.entity).toBe(item.entity);
});

test('ItemUpdateEvent.id', () => {
  expect(event.id).toBe('event');
});

test('ItemUpdateEvent.data', () => {
  jest.spyOn(item, 'data', 'get')
    .mockReturnValue({ id: item.id, value: 1 });

  expect(event.data).toEqual({ id: item.id, value: 1 });
});

test('ItemUpdateEvent.isPending', () => {
  jest.spyOn(item, 'isPending', 'get')
    .mockReturnValue(true);

  expect(event.isPending).toBe(true);
});

test('ItemUpdateEvent.lastQuery', () => {
  expect(event.lastQuery).toBe(item.lastQuery);
});

test('ItemUpdateEvent.lastError', () => {
  const error = new Error();

  jest.spyOn(item, 'lastError', 'get')
    .mockReturnValue(error);

  expect(event.lastError).toBe(error);
});
