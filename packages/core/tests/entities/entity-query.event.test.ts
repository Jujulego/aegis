import { AegisEntity, AegisMemoryStore, EntityUpdateEvent, StoreUpdateEvent } from '../../src';

// Setup
let event: EntityUpdateEvent;

beforeEach(() => {
  const store = new AegisMemoryStore();
  const entity = new AegisEntity('test', store);
  event = new EntityUpdateEvent(
    entity,
    new StoreUpdateEvent<number>(entity.name, 'event', 1, 2),
  );
});

// Tests
test('EntityUpdateEvent.id', () => {
  expect(event.id).toBe('event');
});

test('EntityUpdateEvent.newValue', () => {
  expect(event.newValue).toBe(1);
});

test('EntityUpdateEvent.oldValue', () => {
  expect(event.oldValue).toBe(2);
});
