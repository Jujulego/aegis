import { vi } from 'vitest';

import { Aegis, aegis } from '@/src/index.js';

// Types
interface TestData {
  id: number;
  data: string;
}

// Tests
describe('aegis', () => {
  it('should return a reference containing blade\'s result', async () => {
    const blade = vi.fn((id: number) => ({
      id,
      data: 'life'
    }));

    const ref = aegis(blade);

    await expect(ref.refresh(42)).resolves.toEqual({
      id: 42,
      data: 'life',
    });

    expect(blade).toHaveBeenCalledWith(42);
  });

  describe('aegis.read', () => {
    let ref: Aegis<TestData, [number]>;

    beforeEach(() => {
      ref = aegis((id) => ({ id, data: 'life' }));
    });

    it('should return result when blade resolves', async () => {
      setTimeout(() => ref.refresh(42), 0);

      await expect(ref.read()).resolves.toEqual({
        id: 42,
        data: 'life'
      });
    });

    it('should return if aegis has a result', async () => {
      await ref.refresh(42);

      await expect(ref.read()).resolves.toEqual({
        id: 42,
        data: 'life'
      });
    });
  });

  describe('aegis.data', () => {
    let ref: Aegis<TestData, [number]>;

    beforeEach(() => {
      ref = aegis((id) => ({ id, data: 'life' }));
    });

    it('should return `undefined` if it has no result', () => {
      expect(ref.data).toBeUndefined();
    });

    it('should return result if it has one', async () => {
      await ref.refresh(42);

      expect(ref.data).toEqual({
        id: 42,
        data: 'life'
      });
    });
  });

  describe('aegis.isEmpty', () => {
    let ref: Aegis<TestData, [number]>;

    beforeEach(() => {
      ref = aegis((id) => ({ id, data: 'life' }));
    });

    it('should return `true` if it has no result', () => {
      expect(ref.isEmpty).toBe(true);
    });

    it('should return `false` if it has a result', async () => {
      await ref.refresh(42);

      expect(ref.isEmpty).toBe(false);
    });
  });
});
