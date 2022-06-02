import { AegisEntity, AegisMemoryStore, EntityUpdateEvent, StoreUpdateEvent } from '../../src';

// Types
interface TestEntity {
  id: string;
  value: number;
}

// Setup
let event: EntityUpdateEvent;

beforeEach(() => {
  const store = new AegisMemoryStore();
  const entity = new AegisEntity<TestEntity>('test', store, ({ id }) => id);

  event = new EntityUpdateEvent(
    entity,
    new StoreUpdateEvent(
      entity.name, 'event',
      { id: 'event', value: 1 },
      { id: 'event', value: 2 }),
  );
});

// Tests
test('EntityUpdateEvent.id', () => {
  expect(event.id).toBe('event');
});

test('EntityUpdateEvent.newValue', () => {
  expect(event.newValue).toEqual({ id: 'event', value: 1 });
});

test('EntityUpdateEvent.oldValue', () => {
  expect(event.oldValue).toEqual({ id: 'event', value: 2 });
});
