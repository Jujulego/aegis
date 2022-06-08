import { AegisQuery, QueryUpdateEvent } from '../../src';

// Setup
let controller: AbortController;
let query: AegisQuery<string>;
const updateEventSpy = jest.fn<void, [QueryUpdateEvent<string>]>();

beforeEach(() => {
  controller = new AbortController();
  query = new AegisQuery(controller);

  updateEventSpy.mockReset();
  query.addEventListener('update', updateEventSpy);
  jest.spyOn(controller, 'abort').mockImplementation();
});

// Tests
describe('new AegisQuery', () => {
  it('should return be in "pending" state after initialization', () => {
    expect(query.status).toBe('pending');
    expect(query.state).toEqual({ status: 'pending' });
  });
});

describe('AegisQuery.addEventListener', () => {
  const cb = jest.fn();

  beforeEach(() => {
    jest.spyOn(EventTarget.prototype, 'addEventListener');
  });

  afterEach(() => {
    jest.mocked(EventTarget.prototype.addEventListener).mockRestore();
  });

  it('should add controller\'s signal', () => {
    query.addEventListener('update', cb);

    expect(EventTarget.prototype.addEventListener)
      .toHaveBeenCalledWith('update', cb, { signal: controller.signal });
  });

  it('should add controller\'s signal and pass boolean as capture', () => {
    query.addEventListener('update', cb, true);

    expect(EventTarget.prototype.addEventListener)
      .toHaveBeenCalledWith('update', cb, { capture: true, signal: controller.signal });
  });

  it('should not replace given signal', () => {
    const ctrl = new AbortController();
    query.addEventListener('update', cb, { signal: ctrl.signal });

    expect(EventTarget.prototype.addEventListener)
      .toHaveBeenCalledWith('update', cb, { signal: ctrl.signal });
  });
});

describe('AegisQuery.then', () => {
  it('should resolve as a promise (await)', async () => {
    query.store('result');

    await expect(query).resolves.toBe('result');
  });

  it('should resolve as a promise (then fulfill)', async () => {
    const fulfill = jest.fn((txt: string) => txt.length);
    const prm = query.then(fulfill);

    query.store('result');

    await expect(prm).resolves.toBe(6);
    expect(fulfill).toHaveBeenCalledWith('result');
  });

  it('should reject as a promise (await)', async () => {
    query.error(new Error('fail'));

    await expect(query).rejects.toEqual(new Error('fail'));
  });

  it('should resolve as a promise (then reject)', async () => {
    const reject = jest.fn((err: Error) => err.message);
    const prm = query.then(null, reject);

    query.error(new Error('failed'));

    await expect(prm).resolves.toBe('failed');
    expect(reject).toHaveBeenCalledWith(new Error('failed'));
  });

  it('should reject if fulfill callback fails', async () => {
    const prm = query.then(() => {
      throw new Error('Fulfill failed');
    });

    query.store('result');

    await expect(prm).rejects.toEqual(new Error('Fulfill failed'));
  });

  it('should reject if reject callback fails', async () => {
    const prm = query.then(null, () => {
      throw new Error('Reject failed');
    });

    query.error(new Error('failed'));

    await expect(prm).rejects.toEqual(new Error('Reject failed'));
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
      state: {
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
      state: {
        status: 'error',
        data: new Error('fail')
      }
    }));
  });
});

describe('AegisQuery.cancel', () => {
  it('should call given AbortController\'s abort', () => {
    query.cancel();

    expect(controller.abort).toHaveBeenCalledTimes(1);
  });
});
