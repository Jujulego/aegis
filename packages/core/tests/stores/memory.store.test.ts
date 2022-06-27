import { AegisMemoryStore, StoreUpdateEvent } from '../../src';

// Setup
let store: AegisMemoryStore;
const updateEventSpy = jest.fn<void, [StoreUpdateEvent]>();

beforeEach(() => {
  store = new AegisMemoryStore();

  updateEventSpy.mockReset();
  store.subscribe('update', updateEventSpy);
});

// Tests
describe('AegisMemoryStore.get', () => {
  it('should return undefined for unknown entities', () => {
    expect(store.get('unknown', 'unknown')).toBeUndefined();
  });
});

describe('AegisMemoryStore.set', () => {
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
        type: 'update',
        filters: ['test', 'set'],
        source: store,
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
        type: 'update',
        filters: ['test', 'set'],
        source: store,
      }
    );
  });
});

describe('AegisMemoryStore.delete', () => {
  it('should do nothing if entities does not exists', () => {
    expect(store.delete('test', 'delete')).toBeUndefined();
  });

  it('should delete exiting entities', () => {
    store.set('test', 'delete', 1);
    expect(store.delete<number>('test', 'delete')).toBe(1);
    expect(store.get<number>('test', 'delete')).toBeUndefined();
  });
});
