import { Query, QueryManager, RefreshStrategy } from '../../src';

// Types
interface Test {
  id: string;
  success: boolean;
}

// Setup
let manager: QueryManager<Test>;
const statusEventSpy = jest.fn();

beforeEach(() => {
  manager = new QueryManager();

  jest.resetAllMocks();
  manager.subscribe('status', statusEventSpy);
});

// Tests
describe('QueryManager.refresh', () => {
  it('should call fetcher then store and emit query', () => {
    const query = new Query<Test>();
    const fetcher = jest.fn(() => query);

    // Call refresh
    expect(manager.refresh(fetcher, 'keep')).toBe(query);

    expect(manager.query).toBe(query);
    expect(fetcher).toHaveBeenCalled();
    expect(statusEventSpy).toHaveBeenCalledWith(
      { status: 'pending' },
      { type: 'status.pending', source: manager }
    );
  });

  it('should emit query events', () => {
    const query = new Query<Test>();
    manager.refresh(() => query, 'keep');

    // Emit query events
    // - completed
    statusEventSpy.mockReset();
    query.complete({ id: 'test', success: true });

    expect(statusEventSpy).toHaveBeenCalledWith(
      { status: 'completed', result: { id: 'test', success: true } },
      { type: 'status.completed', source: query }
    );

    // - failed
    statusEventSpy.mockReset();
    query.fail(new Error('Failed !'));

    expect(statusEventSpy).toHaveBeenCalledWith(
      { status: 'failed', error: new Error('Failed !') },
      { type: 'status.failed', source: query }
    );
  });

  describe('\'keep\' strategy', () => {
    let q1: Query<Test>;

    beforeEach(() => {
      q1 = new Query<Test>();
      manager.refresh(() => q1, 'keep');
    });

    it('should keep previous query if still pending', () => {
      const q2 = new Query<Test>();
      const fetcher = jest.fn(() => q2);

      // Call refresh
      expect(manager.refresh(fetcher, 'keep')).toBe(q1);

      expect(manager.query).toBe(q1);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should store new query if previous is not pending', () => {
      const q2 = new Query<Test>();
      const fetcher = jest.fn(() => q2);

      // Call refresh
      q1.complete({ id: 'test', success: true });
      expect(manager.refresh(fetcher, 'keep')).toBe(q2);

      expect(manager.query).toBe(q2);
      expect(fetcher).toHaveBeenCalled();
    });
  });

  describe('\'replace\' strategy', () => {
    let q1: Query<Test>;

    beforeEach(() => {
      q1 = new Query<Test>();
      manager.refresh(() => q1, 'replace');
    });

    it('should cancel previous query if still pending', () => {
      const q2 = new Query<Test>();
      const fetcher = jest.fn(() => q2);

      jest.spyOn(q1, 'cancel');

      // Call refresh
      expect(manager.refresh(fetcher, 'replace')).toBe(q2);

      expect(manager.query).toBe(q2);
      expect(fetcher).toHaveBeenCalled();
      expect(q1.cancel).toHaveBeenCalled();
    });

    it('should ignore events from replaced query', () => {
      const q2 = new Query<Test>();
      manager.refresh(() => q2, 'replace');

      statusEventSpy.mockReset();

      // Emit query events from old query
      q1.complete({ id: 'test', success: true });
      q1.fail(new Error('Failed !'));

      expect(statusEventSpy).not.toHaveBeenCalled();
    });
  });

  it('should throw for unknown strategy', () => {
    manager.refresh(() => new Query(), 'keep');

    expect(() => manager.refresh(() => new Query(), 'unknown' as RefreshStrategy))
      .toThrow(new Error('Unsupported strategy unknown'));
  });
});

describe('QueryManager.nextResult', () => {
  let query: Query<Test>;

  beforeEach(() => {
    query = new Query<Test>();
    manager.refresh(() => query, 'keep');
  });

  it('should resolve when query completes', async () => {
    const prom = manager.nextResult();

    query.complete({ id: 'test', success: true });
    await expect(prom).resolves.toEqual({ id: 'test', success: true });
  });

  it('should rejects when query fails', async () => {
    const prom = manager.nextResult();

    query.fail(new Error('Failed !'));
    await expect(prom).rejects.toEqual(new Error('Failed !'));
  });
});
