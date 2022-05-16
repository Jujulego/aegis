import { Resource, ResourceUpdateEvent } from '../src';

// Setup
let resource: Resource<string>;
const updateEventSpy = jest.fn<void, [ResourceUpdateEvent<string>]>();

beforeEach(() => {
  resource = new Resource();

  updateEventSpy.mockReset();
  resource.addEventListener('update', updateEventSpy);
});

// Tests
describe('new Resource', () => {
  it('should return be in "pending" state after initialization', () => {
    expect(resource.status).toBe('pending');
    expect(resource.state).toEqual({ status: 'pending' });
  });
});

describe('Resource.markPending', () => {
  it('should update internal state', () => {
    // Change resource to "pending" state
    resource.markPending();

    expect(resource.status).toBe('pending');
    expect(resource.state).toEqual({ status: 'pending' });
  });

  it('should previous keep data', () => {
    // Change resource to "pending" state
    resource.store('result');
    resource.markPending();

    expect(resource.status).toBe('pending');
    expect(resource.state).toEqual({ status: 'pending', data: 'result' });
  });

  it('should reset error data', () => {
    // Change resource to "pending" state
    resource.error(new Error('fail'));
    resource.markPending();

    expect(resource.status).toBe('pending');
    expect(resource.state).toEqual({ status: 'pending' });
  });

  it('should emit the "update" event', () => {
    // Change resource to "success" state
    resource.markPending();

    // Check event
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ResourceUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      newState: {
        status: 'pending',
      }
    }));
  });
});

describe('Resource.store', () => {
  it('should update internal state', () => {
    // Change resource to "success" state
    resource.store('result');

    expect(resource.status).toBe('completed');
    expect(resource.state).toEqual({ status: 'completed', data: 'result' });
  });

  it('should emit the "update" event', () => {
    // Change resource to "success" state
    resource.store('result');

    // Check event
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ResourceUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      newState: {
        status: 'completed',
        data: 'result'
      }
    }));
  });
});

describe('Resource.error', () => {
  it('should update internal state', () => {
    // Change resource to "error" state
    resource.error(new Error('fail'));

    expect(resource.status).toBe('error');
    expect(resource.state).toEqual({ status: 'error', data: new Error('fail') });
  });

  it('should emit the "update" event', () => {
    // Change resource to "error" state
    resource.error(new Error('fail'));

    // Check event
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(ResourceUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      newState: {
        status: 'error',
        data: new Error('fail')
      }
    }));
  });
});
