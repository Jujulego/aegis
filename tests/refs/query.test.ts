import { Query } from '@jujulego/utils';
import { vi } from 'vitest';

import { query$, QueryRef } from '@/src/index.js';

// Setup
let qref: QueryRef<number>;

const fetcher = vi.fn<[], Query<number>>();
const spyRef = vi.fn<[number], void>();
const spyPending = vi.fn<[true], void>();
const spyFailed = vi.fn<[Error], void>();

beforeEach(() => {
  vi.resetAllMocks();

  qref = query$(fetcher);
  qref.subscribe(spyRef);
  qref.on('pending', spyPending);
  qref.on('failed', spyFailed);
});

// Tests
describe('query$.refresh', () => {
  it('should call fetcher and emit pending query state', () => {
    const query = new Query<number>();
    fetcher.mockReturnValue(query);

    expect(qref.refresh('keep')).toBe(query);
    expect(qref.query).toBe(query);

    expect(spyPending).toHaveBeenCalledWith(true);
  });

  it('should emit done event when current query is done', () => {
    const query = new Query<number>();
    fetcher.mockReturnValue(query);

    qref.refresh('keep');
    query.done(42);

    expect(qref.data).toBe(42);

    expect(spyRef).toHaveBeenCalledWith(42);
  });

  it('should emit failed event when current query fails', () => {
    const query = new Query<number>();
    fetcher.mockReturnValue(query);

    qref.refresh('keep');

    const error = new Error('Failed !');
    query.fail(error);

    expect(spyFailed).toHaveBeenCalledWith(error);
  });

  describe('keep strategy', () => {
    it('should keep old pending query', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.refresh('keep');

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.refresh('keep')).toBe(q1);

      expect(qref.query).toBe(q1);

      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous is done', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.refresh('keep');
      q1.done(42);

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.refresh('keep')).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous has failed', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.refresh('keep');
      q1.fail(new Error('Failed !'));

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.refresh('keep')).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });
  });

  describe('replace strategy', () => {
    it('should cancel old pending query and replace it', () => {
      const q1 = new Query<number>();
      vi.spyOn(q1, 'cancel');

      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.refresh('replace');

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.refresh('replace')).toBe(q2);

      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
      expect(q1.cancel).toHaveBeenCalled();
    });
  });
});

describe('query$.cancel', () => {
  it('should cancel current query', () => {
    const query = new Query<number>();
    vi.spyOn(query, 'cancel');

    fetcher.mockReturnValue(query);
    qref.refresh('keep');
    qref.cancel();

    expect(query.cancel).toHaveBeenCalled();
  });
});

describe('query$.read', () => {
  it('should resolve to current result', async () => {
    const query = new Query<number>();

    fetcher.mockReturnValue(query);
    qref.refresh('keep');
    query.done(42);

    await expect(qref.read()).resolves.toBe(42);
  });

  it('should resolve when current query succeed', async () => {
    const query = new Query<number>();

    fetcher.mockReturnValue(query);
    qref.refresh('keep');

    setTimeout(() => query.done(42), 0);

    await expect(qref.read()).resolves.toBe(42);
  });

  it('should reject when current query fails', async () => {
    const query = new Query<number>();

    fetcher.mockReturnValue(query);
    qref.refresh('keep');

    setTimeout(() => query.fail(new Error('Failed !')), 0);

    await expect(qref.read()).rejects.toEqual(new Error('Failed !'));
  });
});
