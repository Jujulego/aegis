import { Query } from '@jujulego/utils';
import { vi } from 'vitest';

import { query$, QueryRef, QueryStrategy } from '@/src/refs/query.js';

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

    expect(qref.read()).toBe(query);
    expect(qref.query).toBe(query);

    expect(spyPending).toHaveBeenCalledWith(true);
  });

  it('should emit done event when current query is done', () => {
    const query = new Query<number>();
    fetcher.mockReturnValue(query);

    qref.read();
    query.done(42);

    expect(spyRef).toHaveBeenCalledWith(42);
  });

  it('should emit failed event when current query fails', () => {
    const query = new Query<number>();
    const error = new Error('Failed !');
    fetcher.mockReturnValue(query);

    qref.read();
    query.fail(error);

    expect(spyFailed).toHaveBeenCalledWith(error);
  });

  describe('keep strategy', () => {
    beforeEach(() => {
      qref = query$(fetcher, { strategy: QueryStrategy.keep });
      qref.subscribe(spyRef);
      qref.on('pending', spyPending);
      qref.on('failed', spyFailed);
    });

    it('should keep old pending query', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.read();

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read()).toBe(q1);

      expect(qref.query).toBe(q1);

      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous is done', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.read();
      q1.done(42);

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read()).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });

    it('should use new query from fetcher, as previous has failed', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.read();
      q1.fail(new Error('Failed !'));

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read()).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });
  });

  describe('replace strategy', () => {
    beforeEach(() => {
      qref = query$(fetcher, { strategy: QueryStrategy.replace });
      qref.subscribe(spyRef);
      qref.on('pending', spyPending);
      qref.on('failed', spyFailed);
    });

    it('should cancel old pending query and replace it', () => {
      const q1 = new Query<number>();
      vi.spyOn(q1, 'cancel');

      const q2 = new Query<number>();

      fetcher.mockReturnValue(q1);
      qref.read();

      fetcher.mockClear();
      fetcher.mockReturnValue(q2);
      expect(qref.read()).toBe(q2);

      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
      expect(q1.cancel).toHaveBeenCalled();
    });
  });
});
