import { bind$ } from '@/src/bind.js';
import { var$ } from '@/src/refs/var.js';

// Tests
describe('bind$', () => {
  it('should bind getter to ref read method', () => {
    const value = var$(42);
    vi.spyOn(value, 'read');

    const life = new class {
      @bind$(value)
      accessor value: number;
    };

    expect(life.value).toBe(42);
    expect(value.read).toHaveBeenCalledOnce();
  });

  it('should bind setter to ref mutate method', () => {
    const value = var$(0);
    vi.spyOn(value, 'mutate');

    const life = new class {
      @bind$(value)
      accessor value: number;
    };

    life.value = 42;

    expect(value.mutate).toHaveBeenCalledWith(42);
  });
});