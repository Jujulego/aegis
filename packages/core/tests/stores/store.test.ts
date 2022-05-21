import { AegisMemoryStore, StoreUpdateEvent } from '../../src';

// Setup
let store: AegisMemoryStore;

beforeEach(() => {
  store = new AegisMemoryStore();
});

// Tests
describe('AegisStore.watch', () => {
  it('should call callback when entity is updated', () => {
    const cb = jest.fn<void, [StoreUpdateEvent]>();
    store.watch('test', 'watch', cb);

    store.set('test', 'watch', 1);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(expect.any(StoreUpdateEvent));
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({
      entity: 'test',
      id: 'watch',
      newValue: 1,
    }));
  });

  it('should ignore other entities', () => {
    const cb = jest.fn<void, [StoreUpdateEvent]>();
    store.watch('test', 'watch', cb);

    store.set('test', 'toto', 1);
    expect(cb).not.toHaveBeenCalled();
  });

  it('should when unsubscribed', () => {
    const cb = jest.fn<void, [StoreUpdateEvent]>();
    const unsub = store.watch('test', 'watch', cb);

    unsub();
    store.set('test', 'watch', 1);
    expect(cb).not.toHaveBeenCalled();
  });
});
