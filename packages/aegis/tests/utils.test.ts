import { Query } from '@jujulego/aegis-core';

import { $queryfy } from '../src';

// Tests
describe('$queryfy', () => {
  it('should return the given query', () => {
    const query = new Query();

    expect($queryfy(query)).toBe(query);
  });

  it('should return a query listening to given Promise', async () => {
    let resolve: (_v: string) => void = () => undefined;
    const prom = new Promise<string>((res) => {
      resolve = res;
    });

    // Wrap promise
    const query = $queryfy(prom);

    expect(query).toBeInstanceOf(Query);
    expect(query.status).toBe('pending');

    // Resolve promise
    resolve('test');
    await prom;

    expect(query.status).toBe('completed');
    expect(query.result).toBe('test');
  });
});
