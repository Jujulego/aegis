import { Query, QueryState } from '../../src';

// Setup
let controller: AbortController;
let query: Query<string>;
const statusEventSpy = jest.fn<void, [Readonly<QueryState<string>>]>();

beforeEach(() => {
  controller = new AbortController();
  query = new Query(controller);

  statusEventSpy.mockReset();
  query.subscribe('status', statusEventSpy);
  jest.spyOn(controller, 'abort');
});

// Tests
describe('new Query', () => {
  it('should return be in "pending" state after initialization', () => {
    expect(query.status).toBe('pending');
    expect(query.state).toEqual({ status: 'pending' });
  });
});

describe('Query.fromPromise', () => {
  let query: Query<string>;
  let controller: AbortController;
  let resolve: (result: string) => void;
  let reject: (error: Error) => void;

  beforeEach(() => {
    const prom = new Promise<string>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    controller = new AbortController();
    query = Query.fromPromise(prom, controller);
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
      result: 'success',
    });
  });

  it('should return query that fails when promise reject', async () => {
    reject(new Error('failed'));
    await new Promise((res) => setTimeout(res, 0));

    expect(query.state).toEqual({
      status: 'failed',
      error: new Error('failed'),
    });
  });
});

describe('Query.then', () => {
  it('should resolve as a promise (await)', async () => {
    query.complete('result');

    await expect(query).resolves.toBe('result');
  });

  it('should resolve as a promise (then fulfill)', async () => {
    const fulfill = jest.fn((txt: string) => txt.length);
    const prm = query.then(fulfill);

    query.complete('result');

    await expect(prm).resolves.toBe(6);
    expect(fulfill).toHaveBeenCalledWith('result');
  });

  it('should reject as a promise (await)', async () => {
    query.fail(new Error('fail'));

    await expect(query).rejects.toEqual(new Error('fail'));
  });

  it('should resolve as a promise (then reject)', async () => {
    const reject = jest.fn((err: Error) => err.message);
    const prm = query.then(null, reject);

    query.fail(new Error('failed'));

    await expect(prm).resolves.toBe('failed');
    expect(reject).toHaveBeenCalledWith(new Error('failed'));
  });

  it('should reject if fulfill callback fails', async () => {
    const prm = query.then(() => {
      throw new Error('Fulfill failed');
    });

    query.complete('result');

    await expect(prm).rejects.toEqual(new Error('Fulfill failed'));
  });

  it('should reject if reject callback fails', async () => {
    const prm = query.then(null, () => {
      throw new Error('Reject failed');
    });

    query.fail(new Error('failed'));

    await expect(prm).rejects.toEqual(new Error('Reject failed'));
  });
});

describe('Query.subscribe', () => {
  it('should not call listener if controller aborted', () => {
    controller.abort();

    query.complete('result');
    expect(statusEventSpy).not.toHaveBeenCalled();
  });
});

describe('Query.complete', () => {
  it('should update internal state', () => {
    // Change query to "success" state
    query.complete('result');

    expect(query.status).toBe('completed');
    expect(query.result).toBe('result');
    expect(query.state).toEqual({ status: 'completed', result: 'result' });
  });

  it('should emit the "update" event', () => {
    // Change query to "success" state
    query.complete('result');

    // Check event
    expect(statusEventSpy).toHaveBeenCalledTimes(1);
    expect(statusEventSpy).toHaveBeenCalledWith(
      {
        status: 'completed',
        result: 'result'
      },
      {
        key: 'status.completed',
        origin: query,
      }
    );
  });
});

describe('Query.fail', () => {
  it('should update internal state', () => {
    // Change query to "error" state
    query.fail(new Error('fail'));

    expect(query.status).toBe('failed');
    expect(query.error).toEqual(new Error('fail'));
    expect(query.state).toEqual({ status: 'failed', error: new Error('fail') });
  });

  it('should emit the "update" event', () => {
    // Change query to "error" state
    query.fail(new Error('fail'));

    // Check event
    expect(statusEventSpy).toHaveBeenCalledTimes(1);
    expect(statusEventSpy).toHaveBeenCalledWith(
      {
        status: 'failed',
        error: new Error('fail')
      },
      {
        key: 'status.failed',
        origin: query,
      }
    );
  });
});

describe('Query.cancel', () => {
  it('should call given AbortController\'s abort', () => {
    query.cancel();

    expect(controller.abort).toHaveBeenCalledTimes(1);
  });
});
