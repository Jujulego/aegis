import { MemoryStore, StoreDeleteEvent, StoreUpdateEvent } from '../../src';

// Setup
let store: MemoryStore;
const updateEventSpy = jest.fn<void, [StoreUpdateEvent]>();
const deleteEventSpy = jest.fn<void, [StoreDeleteEvent]>();

beforeEach(() => {
  store = new MemoryStore();

  updateEventSpy.mockReset();
  deleteEventSpy.mockReset();
  store.subscribe('update', updateEventSpy);
  store.subscribe('delete', deleteEventSpy);
});

// Tests
describe('MemoryStore.get', () => {
  it('should return undefined for unknown entities', () => {
    expect(store.get('unknown', 'unknown')).toBeUndefined();
  });
});

describe('MemoryStore.set', () => {
  it('should store given entities', () => {
    expect(store.set('test', 'set', 1)).toBeUndefined();
    expect(store.get<number>('test', 'set')).toBe(1);
  });

  it('should emit event with new entities', async () => {
    store.set('test', 'set', 1);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(
      {
        id: 'set',
        new: 1,
      },
      {
        key: 'update.test.set',
        origin: store,
      }
    );
  });

  it('should update given entities', () => {
    expect(store.set('test', 'set', 1)).toBeUndefined();
    expect(store.set('test', 'set', 2)).toBe(1);
    expect(store.get<number>('test', 'set')).toBe(2);
  });

  it('should emit event with new and old entities', async () => {
    store.set('test', 'set', 1);
    store.set('test', 'set', 2);

    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenLastCalledWith(
      {
        id: 'set',
        old: 1,
        new: 2,
      },
      {
        key: 'update.test.set',
        origin: store,
      }
    );
  });
});

describe('MemoryStore.delete', () => {
  it('should do nothing if entities does not exists', () => {
    expect(store.delete('test', 'delete')).toBeUndefined();
  });

  it('should delete exiting entities', () => {
    store.set('test', 'delete', 1);
    expect(store.delete<number>('test', 'delete')).toBe(1);
    expect(store.get<number>('test', 'delete')).toBeUndefined();

    expect(deleteEventSpy).toHaveBeenCalledTimes(1);
    expect(deleteEventSpy).toHaveBeenCalledWith(
      {
        id: 'delete',
        item: 1,
      },
      {
        key: 'delete.test.delete',
        origin: store,
      }
    );
  });
});
