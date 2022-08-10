import { $entity, $store, AegisEntity, Query } from '@jujulego/aegis';
import { TestScheduler } from 'rxjs/testing';

import { $observable } from '../src';

// Types
interface Test {
  id: string;
  success: boolean;
}

// Setup
let entity: AegisEntity<Test, string>;
let scheduler: TestScheduler;

beforeEach(() => {
  entity = $entity('Test', $store.memory(), (test) => test.id);

  scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
});

// Tests
describe('$observable.item', () => {
  it('should emit initial state and next updates', () => {
    const a = { id: 'test', success: true };
    const b = { id: 'test', success: false };

    // Setup initial state
    entity.$item('test').data = a;

    scheduler.run(({ cold, expectObservable }) => {
      // Schedule updates
      cold('--b--b', { a, b })
        .subscribe((data) => { entity.$item('test').data = data; });

      // Test observable
      expectObservable($observable.item(entity.$item('test')))
        .toBe('a-b--b', { a, b });
    });
  });

  it('should not emit if no initial state (but still emit updates)', () => {
    const a = { id: 'test', success: true };
    const b = { id: 'test', success: false };

    scheduler.run(({ cold, expectObservable }) => {
      // Schedule update
      cold('--a--b', { a, b })
        .subscribe((data) => { entity.$item('test').data = data; });

      // Test observable
      expectObservable($observable.item(entity.$item('test')))
        .toBe('--a--b', { a, b });
    });
  });
});

describe('$observable.list', () => {
  it('should emit initial state and next updates', () => {
    const a = [{ id: 'test', success: true }];
    const b = [{ id: 'test', success: false }];

    // Setup initial state
    entity.$list('test').data = a;

    scheduler.run(({ cold, expectObservable }) => {
      // Schedule updates
      cold('--b--b', { a, b })
        .subscribe((data) => { entity.$list('test').data = data; });

      // Test observable
      expectObservable($observable.list(entity.$list('test')))
        .toBe('a-b--b', { a, b });
    });
  });

  it('should emit empty array if no initial state', () => {
    const e: Test[] = [];
    const a = [{ id: 'test', success: true }];
    const b = [{ id: 'test', success: false }];

    scheduler.run(({ cold, expectObservable }) => {
      // Schedule update
      cold('--a--b', { e, a, b })
        .subscribe((data) => { entity.$list('test').data = data; });

      // Test observable
      expectObservable($observable.list(entity.$list('test')))
        .toBe('e-a--b', { e, a, b });
    });
  });
});

describe('$observable.mutation', () => {
  it('should emit result and complete', () => {
    const r = { id: 'test', success: true };

    const query = new Query<Test>();
    const mutator = entity.$item.mutate(() => query);

    scheduler.run(({ cold, expectObservable }) => {
      // Schedule result
      cold('--r', { r })
        .subscribe((data) => { query.complete(data); });

      // Test observable
      expectObservable($observable.mutation(mutator()))
        .toBe('--(r|)', { r });
    });
  });

  it('should emit error', () => {
    const err = new Error('Failed !');

    const query = new Query<Test>();
    const mutator = entity.$item.mutate(() => query);

    scheduler.run(({ cold, expectObservable }) => {
      // Schedule result
      cold('--e', { e: err })
        .subscribe((error) => { query.fail(error); });

      // Test observable
      expectObservable($observable.mutation(mutator()))
        .toBe('--#', {}, err);
    });
  });
});
