import { StorageStore, StoreDeleteEvent, StoreUpdateEvent } from '../../src';

// Setup
let store: StorageStore;
const updateEventSpy = jest.fn<void, [StoreUpdateEvent]>();
const deleteEventSpy = jest.fn<void, [StoreDeleteEvent]>();

beforeEach(() => {
  localStorage.clear();
  store = new StorageStore(localStorage);

  updateEventSpy.mockReset();
  deleteEventSpy.mockReset();
  store.subscribe('update', updateEventSpy);
  store.subscribe('delete', deleteEventSpy);
});

// Tests
describe('new StorageStore', () => {
  it('should emit update event when StorageEvent is received', () => {
    localStorage.setItem('aegis:test:event', JSON.stringify(2));

    window.dispatchEvent(new StorageEvent('storage', {
      storageArea: localStorage,
      key: 'aegis:test:event',
      newValue: JSON.stringify(2),
      oldValue: JSON.stringify(1)
    }));

    expect(updateEventSpy).toHaveBeenLastCalledWith(
      {
        id: 'event',
        old: 1,
        new: 2,
      },
      {
        key: 'update.test.event',
        origin: store,
      }
    );
    expect(deleteEventSpy).not.toHaveBeenCalled();
  });

  it('should emit update event when StorageEvent is received (no old value)', () => {
    localStorage.setItem('aegis:test:event', JSON.stringify(3));

    window.dispatchEvent(new StorageEvent('storage', {
      storageArea: localStorage,
      key: 'aegis:test:event',
      newValue: JSON.stringify(3),
      oldValue: null
    }));

    expect(updateEventSpy).toHaveBeenLastCalledWith(
      {
        id: 'event',
        new: 3,
      },
      {
        key: 'update.test.event',
        origin: store,
      }
    );
    expect(deleteEventSpy).not.toHaveBeenCalled();
  });

  it('should emit delete event when StorageEvent is received (no new value)', () => {
    localStorage.setItem('aegis:test:event', JSON.stringify(3));

    window.dispatchEvent(new StorageEvent('storage', {
      storageArea: localStorage,
      key: 'aegis:test:event',
      newValue: null,
      oldValue: JSON.stringify(2)
    }));

    expect(updateEventSpy).not.toHaveBeenCalled();
    expect(deleteEventSpy).toHaveBeenLastCalledWith(
      {
        id: 'event',
        item: 2,
      },
      {
        key: 'delete.test.event',
        origin: store,
      }
    );
  });

  it('should ignore StorageEvent it has not an aegis key', () => {
    window.dispatchEvent(new StorageEvent('storage', {
      storageArea: localStorage,
      key: 'test',
      newValue: JSON.stringify(3)
    }));

    expect(updateEventSpy).not.toHaveBeenCalled();
  });
});

describe('StorageStore.get', () => {
  it('should return undefined for unknown entities', () => {
    expect(store.get('unknown', 'unknown')).toBeUndefined();
  });

  it('should return the same instance', () => {
    store.set('test', 'get', { test: 1, success: true });

    expect(store.get('test', 'get')).toEqual({ test: 1, success: true });
    expect(store.get('test', 'get')).toBe(store.get('test', 'get'));
  });
});

describe('StorageStore.set', () => {
  it('should store given entities', () => {
    expect(store.set('test', 'set', 1)).toBeUndefined();
    expect(store.get<number>('test', 'set')).toBe(1);
    expect(localStorage.getItem('aegis:test:set')).toBe(JSON.stringify(1));
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

describe('StorageStore.delete', () => {
  it('should do nothing if entities does not exists', () => {
    expect(store.delete('test', 'delete')).toBeUndefined();
  });

  it('should delete exiting entities', () => {
    store.set('test', 'delete', 1);
    expect(store.delete<number>('test', 'delete')).toBe(1);
    expect(store.get<number>('test', 'delete')).toBeUndefined();
    expect(localStorage.getItem('aegis:test:delete')).toBeNull();

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
