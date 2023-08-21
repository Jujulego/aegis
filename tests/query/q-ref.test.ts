import { Listener } from '@jujulego/event-tree';
import { Query } from '@jujulego/utils';
import { vi } from 'vitest';

import { QRef } from '@/src/query/q-ref.js';

// Setup
let qref: QRef<number>;

const spyRef: Listener<number> = vi.fn();
const spyPending: Listener<true> = vi.fn();
const spyFailed: Listener<Error> = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  qref = new QRef();
  qref.subscribe(spyRef);
  qref.on('pending', spyPending);
  qref.on('failed', spyFailed);
});

// Tests
describe('new QRef', () => {
  it('should have no query at start', () => {
    expect(qref.query).toBeUndefined();
  });

  it('should have no data at start', () => {
    expect(qref.data).toBeUndefined();
  });

  it('should not be loading at start', () => {
    expect(qref.isLoading).toBe(false);
  });
});

describe('QRef.refresh', () => {
  it('should call fetcher and emit pending query state', () => {
    const query = new Query<number>();
    const fetcher = vi.fn(() => query);

    expect(qref.refresh(fetcher, 'keep')).toBe(query);

    expect(qref.query).toBe(query);
    expect(qref.isLoading).toBe(true);

    expect(spyPending).toHaveBeenCalledWith(true);
  });

  it('should emit done event when current query is done', () => {
    const query = new Query<number>();
    qref.refresh(() => query, 'keep');

    query.done(42);

    expect(spyRef).toHaveBeenCalledWith(42);

    expect(qref.data).toBe(42);
    expect(qref.isLoading).toBe(false);
  });

  it('should emit failed event when current query fails', () => {
    const query = new Query<number>();
    qref.refresh(() => query, 'keep');

    const error = new Error('Failed !');
    query.fail(error);

    expect(spyFailed).toHaveBeenCalledWith(error);

    expect(qref.isLoading).toBe(false);
  });

  describe('keep strategy', () => {
    it('should keep old pending query', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();
      const fetcher = vi.fn(() => q2);

      qref.refresh(() => q1, 'keep');
      expect(qref.refresh(fetcher, 'keep')).toBe(q1);

      expect(qref.query).toBe(q1);

      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous is done', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();
      const fetcher = vi.fn(() => q2);

      qref.refresh(() => q1, 'keep');
      q1.done(42);

      expect(qref.refresh(fetcher, 'keep')).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous has failed', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();
      const fetcher = vi.fn(() => q2);

      qref.refresh(() => q1, 'keep');
      q1.fail(new Error('Failed !'));

      expect(qref.refresh(fetcher, 'keep')).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });
  });

  describe('replace strategy', () => {
    it('should cancel old pending query and replace it', () => {
      const q1 = new Query<number>();
      vi.spyOn(q1, 'cancel');

      const q2 = new Query<number>();
      const fetcher = vi.fn(() => q2);

      qref.refresh(() => q1, 'replace');
      expect(qref.refresh(fetcher, 'replace')).toBe(q2);

      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
      expect(q1.cancel).toHaveBeenCalled();
    });
  });
});

describe('QRef.cancel', () => {
  it('should cancel current query', () => {
    const query = new Query<number>();
    vi.spyOn(query, 'cancel');

    qref.refresh(() => query, 'keep');
    qref.cancel();

    expect(query.cancel).toHaveBeenCalled();
  });
});

describe('QRef.read', () => {
  it('should resolve to current result', async () => {
    const query = new Query<number>();
    qref.refresh(() => query, 'keep');

    query.done(42);

    await expect(qref.read()).resolves.toBe(42);
  });

  it('should resolve when current query succeed', async () => {
    const query = new Query<number>();
    qref.refresh(() => query, 'keep');

    setTimeout(() => query.done(42), 0);

    await expect(qref.read()).resolves.toBe(42);
  });

  it('should reject when current query fails', async () => {
    const query = new Query<number>();
    qref.refresh(() => query, 'keep');

    setTimeout(() => query.fail(new Error('Failed !')), 0);

    await expect(qref.read()).rejects.toEqual(new Error('Failed !'));
  });
});
