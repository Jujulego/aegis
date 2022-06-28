import { $url, urlBuilder } from '../src';

// Tests
describe('url', () => {
  // Test
  it('should return the same string', () => {
    expect($url`/test`).toBe('/test');
  });

  it('should return a builder', () => {
    const builder = $url`/test/${'id'}`;
    expect(builder({ id: 8 })).toBe('/test/8');
  });
});

describe('urlBuilder', () => {
  // Test
  it('should return the same function', () => {
    const arg = (arg: string) => `/test/${arg}`;
    const builder = urlBuilder(arg);

    expect(builder).toBe(arg);
  });

  it('should return a function returning given url', () => {
    const builder = urlBuilder('/test');

    expect(builder()).toBe('/test');
  });
});
