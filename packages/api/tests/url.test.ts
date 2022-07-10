import { $url } from '../src';

// Tests
describe('url', () => {
  // Test
  it('should return the same string', () => {
    const builder = $url`/test`;
    expect(builder()).toBe('/test');
  });

  it('should return a builder', () => {
    const builder = $url`/test/${'id'}`;
    expect(builder({ id: '8' })).toBe('/test/8');
  });
});
