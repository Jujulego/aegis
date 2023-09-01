import { map$ } from '@/src/index.js';

// Tests
describe('map$', () => {
  it('should return a mutable reference on key element', () => {
    const values = map$<string, number>();

    const ref = values.ref('life');
    ref.mutate(42);

    expect(values.ref('life').read()).toBe(42);
  });
});
