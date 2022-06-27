import { EventSource } from '../../src';

// Types
type TestEventMap = {
  test: { data: null, filters: [number] },
};

// Tests
describe('EventSource', () => {
  it('should call registered listeners on emit with target', () => {
    const src = new EventSource<TestEventMap>();

    const typeListener = jest.fn();
    src.subscribe('test', typeListener);

    const targetListener = jest.fn();
    src.subscribe('test.1', targetListener);

    src.emit('test.1', null);

    expect(typeListener).toHaveBeenCalledWith({ type: 'test', key: ['1'], data: null, source: src });
    expect(targetListener).toHaveBeenCalledWith({ type: 'test', key: ['1'], data: null, source: src });
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
