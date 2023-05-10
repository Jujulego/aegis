import { Listener } from '@jujulego/event-tree';

import { DataAccessor, DRef } from '@/src';

// Setup
let dref: DRef<number>;
let assessor: DataAccessor<number>;

const spyRef: Listener<number> = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();

  assessor = {
    isEmpty: jest.fn().mockReturnValue(false),
    read: jest.fn().mockReturnValue(42),
    update: jest.fn(),
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
    jest.mocked(assessor.read).mockReturnValue(undefined);

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
    jest.mocked(assessor.read).mockReturnValue(undefined);

    expect(dref.isEmpty).toBe(true);
    expect(assessor.read).toHaveBeenCalled();
  });
});
