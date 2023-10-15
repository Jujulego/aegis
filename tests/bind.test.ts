import { BindRef } from '@/src/bind.js';
import { const$ } from '@/src/refs/const.js';
import { var$ } from '@/src/refs/var.js';

// Tests
describe('bind$', () => {
  it('should bind getter to ref read method', () => {
    const value = const$(42);
    vi.spyOn(value, 'read');

    const life = new class {
      @BindRef(value)
      accessor value: 42;
    };

    expect(life.value).toBe(42);
    expect(value.read).toHaveBeenCalledOnce();
  });

  it('should throw on attempt to set a accessor bound to a read only reference', () => {
    const value = const$(42);
    vi.spyOn(value, 'read');

    const life = new class {
      @BindRef(value)
      accessor value: number;
    };

    expect(() => { life.value = 42; }).toThrow('Cannot set value, it is bound to a readonly reference');
  });

  it('should bind setter to ref mutate method', () => {
    const value = var$(0);
    vi.spyOn(value, 'mutate');

    const life = new class {
      @BindRef(value)
      accessor value: number;
    };

    life.value = 42;

    expect(value.mutate).toHaveBeenCalledWith(42);
  });
});