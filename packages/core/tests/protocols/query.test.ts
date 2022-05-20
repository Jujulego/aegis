import { AegisQuery, QueryUpdateEvent } from '../../src';

// Setup
let query: AegisQuery<string>;
const updateEventSpy = jest.fn<void, [QueryUpdateEvent<string>]>();

beforeEach(() => {
  query = new AegisQuery();

  updateEventSpy.mockReset();
  query.addEventListener('update', updateEventSpy);
});

// Tests
describe('new AegisQuery', () => {
  it('should return be in "pending" state after initialization', () => {
    expect(query.status).toBe('pending');
    expect(query.state).toEqual({ status: 'pending' });
  });
});

describe('AegisQuery.store', () => {
  it('should update internal state', () => {
    // Change query to "success" state
    query.store('result');

    expect(query.status).toBe('completed');
    expect(query.state).toEqual({ status: 'completed', data: 'result' });
  });

  it('should emit the "update" event', () => {
    // Change query to "success" state
    query.store('result');

    // Check event
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(QueryUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      newState: {
        status: 'completed',
        data: 'result'
      }
    }));
  });
});

describe('AegisQuery.error', () => {
  it('should update internal state', () => {
    // Change query to "error" state
    query.error(new Error('fail'));

    expect(query.status).toBe('error');
    expect(query.state).toEqual({ status: 'error', data: new Error('fail') });
  });

  it('should emit the "update" event', () => {
    // Change query to "error" state
    query.error(new Error('fail'));

    // Check event
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(expect.any(QueryUpdateEvent));
    expect(updateEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      newState: {
        status: 'error',
        data: new Error('fail')
      }
    }));
  });
});
