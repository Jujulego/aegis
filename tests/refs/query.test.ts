import { Query } from '@jujulego/utils';
import { vi } from 'vitest';

import { query$, QueryRef, QueryStrategy } from '@/src/index.js';

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
describe('query$.read', () => {
  it('should call fetcher and emit pending query state', () => {
    const query = new Query<number>();
    fetcher.mockReturnValue(query);

    expect(qref.read(QueryStrategy.keep)).toBe(query);
    expect(qref.query).toBe(query);

    expect(spyPending).toHaveBeenCalledWith(true);
  });

  it('should emit done event when current query is done', () => {
    const query = new Query<number>();
    fetcher.mockReturnValue(query);

    qref.read(QueryStrategy.keep);
    query.done(42);

    expect(spyRef).toHaveBeenCalledWith(42);
  });

  it('should emit failed event when current query fails', () => {
    const query = new Query<number>();
    const error = new Error('Failed !');
    fetcher.mockReturnValue(query);

    qref.read(QueryStrategy.keep);
    query.fail(error);

    expect(spyFailed).toHaveBeenCalledWith(error);
  });

  describe('keep strategy', () => {
    it('should keep old pending query', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.read(QueryStrategy.keep);

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read(QueryStrategy.keep)).toBe(q1);

      expect(qref.query).toBe(q1);

      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous is done', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.read(QueryStrategy.keep);
      q1.done(42);

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read(QueryStrategy.keep)).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous has failed', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.read(QueryStrategy.keep);
      q1.fail(new Error('Failed !'));

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read(QueryStrategy.keep)).toBe(q2);
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
      qref.read(QueryStrategy.replace);

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read(QueryStrategy.replace)).toBe(q2);

      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
      expect(q1.cancel).toHaveBeenCalled();
    });
  });
});
