import { vi } from 'vitest';

import { QueryManager } from '@/src/index.js';

// Setup
let manager: QueryManager<number>;

beforeEach(() => {
  manager = new QueryManager();
});

// Tests
describe('QueryManager', () => {
  it('should always return the same ref for the same key', () => {
    const ref = manager.ref('life');

    expect(manager.ref('life')).toBe(ref);
  });

  it('should call refresh on ref', () => {
    const fetcher = async () => 42;
    const ref = manager.ref('life');

    vi.spyOn(ref, 'refresh');

    expect(manager.refresh('life', fetcher, 'replace')).toBe(ref);

    expect(ref.refresh).toHaveBeenCalledWith(fetcher, 'replace');
  });
});
