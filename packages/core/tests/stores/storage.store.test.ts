import { AegisStorageStore, StoreUpdateEvent } from '../../src';

// Setup
let store: AegisStorageStore;
const updateEventSpy = jest.fn<void, [StoreUpdateEvent]>();

beforeEach(() => {
  localStorage.clear();
  store = new AegisStorageStore(localStorage);

  updateEventSpy.mockReset();
  store.addEventListener('update', updateEventSpy);
});

// Tests
describe('new AegisStorageStore', () => {
  it('should emit update event when StorageEvent is received', () => {
    localStorage.setItem('aegis:test:event', JSON.stringify(2));

    window.dispatchEvent(new StorageEvent('storage', {
      storageArea: localStorage,
      key: 'aegis:test:event',
      newValue: JSON.stringify(2),
      oldValue: JSON.stringify(1)
    }));

    expect(updateEventSpy).toHaveBeenLastCalledWith(expect.any(StoreUpdateEvent));
    expect(updateEventSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      entity: 'test',
      id: 'event',
      newValue: 2,
      oldValue: 1,
    }));
  });

  it('should emit update event when StorageEvent is received (no old value)', () => {
    localStorage.setItem('aegis:test:event', JSON.stringify(3));

    window.dispatchEvent(new StorageEvent('storage', {
      storageArea: localStorage,
      key: 'aegis:test:event',
      newValue: JSON.stringify(3)
    }));

    expect(updateEventSpy).toHaveBeenLastCalledWith(expect.any(StoreUpdateEvent));
    expect(updateEventSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      entity: 'test',
      id: 'event',
      newValue: 3,
    }));
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

describe('AegisStorageStore.get', () => {
  it('should return undefined for unknown entity', () => {
    expect(store.get('unknown', 'unknown')).toBeUndefined();
  });
});

describe('AegisStorageStore.set', () => {
  it('should store given entity', () => {
    expect(store.set('test', 'set', 1)).toBeUndefined();
    expect(store.get<number>('test', 'set')).toBe(1);
    expect(localStorage.getItem('aegis:test:set')).toBe(JSON.stringify(1));
  });

  it('should emit event with new entity', async () => {
    store.set('test', 'set', 1);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(StoreUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      entity: 'test',
      id: 'set',
      newValue: 1,
    }));
  });

  it('should update given entity', () => {
    expect(store.set('test', 'set', 1)).toBeUndefined();
    expect(store.set('test', 'set', 2)).toBe(1);
    expect(store.get<number>('test', 'set')).toBe(2);
  });

  it('should emit event with new and old entities', async () => {
    store.set('test', 'set', 1);
    store.set('test', 'set', 2);

    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenLastCalledWith(expect.any(StoreUpdateEvent));
    expect(updateEventSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      entity: 'test',
      id: 'set',
      newValue: 2,
      oldValue: 1,
    }));
  });
});

describe('AegisStorageStore.delete', () => {
  it('should do nothing if entity does not exists', () => {
    expect(store.delete('test', 'delete')).toBeUndefined();
  });

  it('should delete exiting entity', () => {
    store.set('test', 'delete', 1);
    expect(store.delete<number>('test', 'delete')).toBe(1);
    expect(store.get<number>('test', 'delete')).toBeUndefined();
    expect(localStorage.getItem('aegis:test:delete')).toBeNull();
  });
});
