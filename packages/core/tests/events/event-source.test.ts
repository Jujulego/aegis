import { Event, EventSource } from '../../src';

// Types
type TestEvent = Event<'test'>;

// Tests
describe('EventSource.emit', () => {
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
});
