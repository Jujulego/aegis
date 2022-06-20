import { AegisQuery, QueryState, UpdateEvent } from '../../src';

// Setup
let controller: AbortController;
let query: AegisQuery<string>;
const updateEventSpy = jest.fn<void, [UpdateEvent<QueryState<string>>]>();

beforeEach(() => {
  controller = new AbortController();
  query = new AegisQuery(controller);

  updateEventSpy.mockReset();
  query.subscribe('update', updateEventSpy);
  jest.spyOn(controller, 'abort').mockImplementation();
});

// Tests
describe('new AegisQuery', () => {
  it('should return be in "pending" state after initialization', () => {
    expect(query.status).toBe('pending');
    expect(query.state).toEqual({ status: 'pending' });
  });
});

describe('AegisQuery.fromPromise', () => {
  let query: AegisQuery<string>;
  let controller: AbortController;
  let resolve: (result: string) => void;
  let reject: (error: Error) => void;

  beforeEach(() => {
    const prom = new Promise<string>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    controller = new AbortController();
    query = AegisQuery.fromPromise(prom, controller);
  });

  it('should return a pending query', () => {
    expect(query.status).toBe('pending');
    expect(query.controller).toBe(controller);
  });

  it('should return query that completes when promise resolves', async () => {
    resolve('success');
    await new Promise((res) => setTimeout(res, 0));

    expect(query.state).toEqual({
      status: 'completed',
      data: 'success',
    });
  });

  it('should return query that fails when promise reject', async () => {
    reject(new Error('failed'));
    await new Promise((res) => setTimeout(res, 0));

    expect(query.state).toEqual({
      status: 'error',
      data: new Error('failed'),
    });
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
    expect(updateEventSpy).toHaveBeenCalledWith({
      type: 'update',
      key: ['completed'],
      source: query,
      data: {
        old: {
          status: 'pending'
        },
        data: {
          status: 'completed',
          data: 'result'
        }
      }
    });
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
    expect(updateEventSpy).toHaveBeenCalledWith({
      type: 'update',
      key: ['error'],
      source: query,
      data: {
        old: {
          status: 'pending'
        },
        data: {
          status: 'error',
          data: new Error('fail')
        }
      }
    });
  });
});

describe('AegisQuery.cancel', () => {
  it('should call given AbortController\'s abort', () => {
    query.cancel();

    expect(controller.abort).toHaveBeenCalledTimes(1);
  });
});
