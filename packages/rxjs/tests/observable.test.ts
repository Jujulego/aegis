import { $entity, $store, AegisEntity } from '@jujulego/aegis';

import { $observable } from '../src';

// Types
interface Test {
  id: string;
  success: boolean;
}

// Setup
let entity: AegisEntity<Test, string>;

beforeEach(() => {
  entity = $entity('Test', $store.memory(), (test) => test.id);
});

// Tests
describe('$observable', () => {
  describe('$observable.item', () => {
    it('should emit at when item change', () => {
      const spy = jest.fn();

      $observable.item(entity.$item('test'))
        .subscribe(spy);

      // Update item
      entity.$item('test').data = { id: 'test', success: true };

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: 'test', success: true });
    });

    it('should emit initial state', () => {
      entity.$item('test').data = { id: 'test', success: true };

      const spy = jest.fn();

      $observable.item(entity.$item('test'))
        .subscribe(spy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ id: 'test', success: true });
    });
  });

  describe('$observable.list', () => {
    it('should emit at when list change', () => {
      const spy = jest.fn();

      $observable.list(entity.$list('test'))
        .subscribe(spy);

      // Update item
      entity.$list('test').data = [{ id: 'test', success: true }];

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith([]);
      expect(spy).toHaveBeenCalledWith([{ id: 'test', success: true }]);
    });
  });
});
