import { vi } from 'vitest';

import { Manager, manager$, ManagerFetcher } from '@/src/index.js';

// Setup
let fetcher: ManagerFetcher<string, number>;
let manager: Manager<string, number>;

beforeEach(() => {
  fetcher = vi.fn(async () => 42);
  manager = manager$(fetcher);
});

// Tests
describe('manager$', () => {
  it('should always return the same ref for the same key', () => {
    const ref = manager.ref('life');

    expect(manager.ref('life')).toBe(ref);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('should call refresh on ref', () => {
    const ref = manager.ref('life');
    vi.spyOn(ref, 'refresh');

    expect(manager.refresh('life', 'replace')).toBe(ref);

    expect(ref.refresh).toHaveBeenCalledWith('replace');
    expect(fetcher).toHaveBeenCalledWith('life');
  });
});
