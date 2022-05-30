import { AegisEntity, AegisItem, AegisMemoryStore, AegisQuery, ItemUpdateEvent } from '../../src';

// Setup
let item: AegisItem<number>;
let event: ItemUpdateEvent;

beforeEach(() => {
  const store = new AegisMemoryStore();
  const entity = new AegisEntity<number>('test', store);
  const query = new AegisQuery<number>();
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
    .mockReturnValue(1);

  expect(event.data).toBe(1);
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
