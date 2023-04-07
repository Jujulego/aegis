import { Listener } from '@jujulego/event-tree';
import { Query, QueryState } from '@jujulego/utils';

import { QRef } from '@/src';

// Setup
let qref: QRef<number>;
let qrefSpy: Listener<QueryState<number>>;

beforeEach(() => {
  qref = new QRef();

  qrefSpy = jest.fn();
  qref.subscribe(qrefSpy);
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
    const fetcher = jest.fn(() => query);

    expect(qref.refresh(fetcher, 'keep')).toBe(query);

    expect(qref.query).toBe(query);
    expect(qref.isLoading).toBe(true);

    expect(qrefSpy).toHaveBeenCalledWith({ status: 'pending' });
  });

  describe('keep strategy', () => {
    it('should use old pending query', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();
      const fetcher = jest.fn(() => q2);

      qref.refresh(() => q1, 'keep');
      expect(qref.refresh(fetcher, 'keep')).toBe(q1);

      expect(qref.query).toBe(q1);

      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should use new query from fetcher', () => {
      const q1 = new Query<number>();
      const q2 = new Query<number>();
      const fetcher = jest.fn(() => q2);

      qref.refresh(() => q1, 'keep');
      q1.done(42);

      expect(qref.refresh(fetcher, 'keep')).toBe(q2);
      expect(qref.query).toBe(q2);

      expect(fetcher).toHaveBeenCalled();
    });
  });
});
