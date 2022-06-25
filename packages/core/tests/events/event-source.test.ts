import { Event, EventSource } from '../../src';

// Types
type TestEvent = Event<'test'>;

// Tests
describe('EventSource', () => {
  it('should call registered listeners on emit without target', () => {
    const src = new EventSource<TestEvent>();

    const typeListener = jest.fn();
    src.subscribe('test', typeListener);

    const targetListener = jest.fn();
    src.subscribe('test', targetListener, { key: ['1'] });

    src.emit('test', null);

    expect(typeListener).toHaveBeenCalledWith({ type: 'test', data: null, source: src });
    expect(targetListener).not.toHaveBeenCalled();
  });

  it('should call registered listeners on emit with target', () => {
    const src = new EventSource<TestEvent>();

    const typeListener = jest.fn();
    src.subscribe('test', typeListener);

    const targetListener = jest.fn();
    src.subscribe('test', targetListener, { key: ['1'] });

    src.emit('test', null, { key: ['1'] });

    expect(typeListener).toHaveBeenCalledWith({ type: 'test', key: ['1'], data: null, source: src });
    expect(targetListener).toHaveBeenCalledWith({ type: 'test', key: ['1'], data: null, source: src });
  });

  it('should not call unsubscribed listeners', () => {
    const src = new EventSource<TestEvent>();

    const listener = jest.fn();
    const unsub = src.subscribe('test', listener);

    unsub();
    src.emit('test', null, { key: ['1'] });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should not call registered listeners if controller aborted', () => {
    const ctrl = new AbortController();
    const src = new EventSource<TestEvent>();

    const listener = jest.fn();
    src.subscribe('test', listener, { signal: ctrl.signal });

    ctrl.abort();
    src.emit('test', null, { key: ['1'] });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should not call registered listeners if inner controller aborted', () => {
    class AbortableSource extends EventSource<TestEvent> {
      controller = new AbortController();
    }
    const src = new AbortableSource();

    const listener = jest.fn();
    src.subscribe('test', listener);

    src.controller.abort();
    src.emit('test', null, { key: ['1'] });

    expect(listener).not.toHaveBeenCalled();
  });
});
