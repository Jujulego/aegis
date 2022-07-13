import { EventSource } from '../../src';

// Types
type TestEventMap = Record<`test.${number}`, null>;

// Tests
describe('EventSource', () => {
  it('should call registered listeners on emit with target', () => {
    const src = new EventSource<TestEventMap>();

    const typeListener = jest.fn();
    src.subscribe('test', typeListener);

    const targetListener = jest.fn();
    src.subscribe('test.1', targetListener);

    src.emit('test.1', null);

    expect(typeListener).toHaveBeenCalledWith(null, { type: 'test.1', source: src });
    expect(targetListener).toHaveBeenCalledWith(null, { type: 'test.1', source: src });
  });

  it('should not call unsubscribed listeners', () => {
    const src = new EventSource<TestEventMap>();

    const listener = jest.fn();
    const unsub = src.subscribe('test', listener);

    unsub();
    src.emit('test.1', null);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should not call registered listeners if controller aborted', () => {
    const ctrl = new AbortController();
    const src = new EventSource<TestEventMap>();

    const listener = jest.fn();
    src.subscribe('test', listener, { signal: ctrl.signal });

    ctrl.abort();
    src.emit('test.1', null);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should not call registered listeners if inner controller aborted', () => {
    class AbortableSource extends EventSource<TestEventMap> {
      controller = new AbortController();
    }

    const src = new AbortableSource();

    const listener = jest.fn();
    src.subscribe('test', listener);

    src.controller.abort();
    src.emit('test.1', null);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('EventSource.waitFor', () => {
  it('should resolve when event is emitted', async () => {
    const src = new EventSource<TestEventMap>();

    const prom = src.waitFor('test');
    src.emit('test.1', null);

    await expect(prom).resolves.toEqual([null, { type: 'test.1', source: src }]);
  });

  it('should reject if controller aborted', async () => {
    const ctrl = new AbortController();
    const src = new EventSource<TestEventMap>();

    const prom = src.waitFor('test', { signal: ctrl.signal });
    ctrl.abort();

    await expect(prom).rejects.toBeInstanceOf(Error);
  });

  it('should reject if inner controller aborted', async () => {
    class AbortableSource extends EventSource<TestEventMap> {
      controller = new AbortController();
    }

    const src = new AbortableSource();

    const prom = src.waitFor('test');
    src.controller.abort();

    await expect(prom).rejects.toBeInstanceOf(Error);
  });
});
