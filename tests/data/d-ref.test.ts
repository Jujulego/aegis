import { Listener } from '@jujulego/event-tree';
import { vi } from 'vitest';

import { DRef } from '@/src/data/d-ref.js';
import { DataAccessor } from '@/src/defs/index.js';

// Setup
let dref: DRef<number>;
let assessor: DataAccessor<number>;

const spyRef: Listener<number> = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();

  assessor = {
    isEmpty: vi.fn().mockReturnValue(false),
    read: vi.fn().mockReturnValue(42),
    update: vi.fn(),
  };
  dref = new DRef<number>(assessor);
  dref.subscribe(spyRef);
});

// Tests
describe('DRef.read', () => {
  it('should return data if not empty', async () => {
    await expect(dref.read()).resolves.toBe(42);
  });

  it('should wait for an update if empty', async () => {
    vi.mocked(assessor.read).mockReturnValue(undefined);

    setTimeout(() => dref.update(2));
    await expect(dref.read()).resolves.toBe(2);
  });
});

describe('DRef.update', () => {
  it('should call assessor update with given value', () => {
    dref.update(2);

    expect(assessor.update).toHaveBeenCalledWith(2);
  });

  it('should emit given value', () => {
    dref.update(2);

    expect(spyRef).toHaveBeenCalledWith(2);
  });
});

describe('DRef.data', () => {
  it('should call assessor read', () => {
    expect(dref.data).toBe(42);
    expect(assessor.read).toHaveBeenCalled();
  });
});

describe('DRef.isEmpty', () => {
  it('should call assessor isEmpty', () => {
    expect(dref.isEmpty).toBe(false);
    expect(assessor.isEmpty).toHaveBeenCalled();
  });

  it('should use assessor read result if it has no isEmpty (defined => false)', () => {
    delete assessor.isEmpty;

    expect(dref.isEmpty).toBe(false);
    expect(assessor.read).toHaveBeenCalled();
  });

  it('should use assessor read result if it has no isEmpty (undefined => true)', () => {
    delete assessor.isEmpty;
    vi.mocked(assessor.read).mockReturnValue(undefined);

    expect(dref.isEmpty).toBe(true);
    expect(assessor.read).toHaveBeenCalled();
  });
});
