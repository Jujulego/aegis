import { DVar } from '@/src';

// Tests
describe('DVar', () => {
  it('should be empty at start', () => {
    const dvar = new DVar();

    expect(dvar.isEmpty).toBe(true);
    expect(dvar.data).toBeUndefined();
  });

  it('should store initial data', () => {
    const dvar = new DVar(42);

    expect(dvar.isEmpty).toBe(false);
    expect(dvar.data).toBe(42);
  });

  it('should store updates', () => {
    const dvar = new DVar<number>();
    dvar.update(42);

    expect(dvar.isEmpty).toBe(false);
    expect(dvar.data).toBe(42);
  });
});
