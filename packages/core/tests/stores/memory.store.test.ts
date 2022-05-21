import { AegisMemoryStore, StoreUpdateEvent } from '../../src';

// Setup
let memory: AegisMemoryStore;
const updateEventSpy = jest.fn<void, [StoreUpdateEvent]>();

beforeEach(() => {
  memory = new AegisMemoryStore();

  updateEventSpy.mockReset();
  memory.addEventListener('update', updateEventSpy);
});

// Tests
describe('AegisMemoryStore.get', () => {
  it('should return undefined for unknown entity', () => {
    expect(memory.get('unknown', 'unknown')).toBeUndefined();
  });
});

describe('AegisMemoryStore.set', () => {
  it('should store given entity', () => {
    expect(memory.set('test', 'set', 1)).toBeUndefined();
    expect(memory.get<number>('test', 'set')).toBe(1);
  });

  it('should emit event with new entity', async () => {
    memory.set('test', 'set', 1);

    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(StoreUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      entity: 'test',
      id: 'set',
      newValue: 1,
    }));
  });

  it('should update given entity', () => {
    expect(memory.set('test', 'set', 1)).toBeUndefined();
    expect(memory.set('test', 'set', 2)).toBe(1);
    expect(memory.get<number>('test', 'set')).toBe(2);
  });

  it('should emit event with new and old entities', async () => {
    memory.set('test', 'set', 1);
    memory.set('test', 'set', 2);

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
