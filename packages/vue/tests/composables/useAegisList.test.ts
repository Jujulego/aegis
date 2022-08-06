import { $entity, $store, AegisEntity } from '@jujulego/aegis';
import VueCompositionAPI, { computed, ref } from '@vue/composition-api';
import Vue from 'vue';

import { useAegisList } from '../../src';

// Types
interface Test {
  id: string;
  success: boolean;
}

// Setup
let entity: AegisEntity<Test, string>;

beforeAll(() => {
  Vue.use(VueCompositionAPI);
});

beforeEach(() => {
  entity = $entity('Test', $store.memory(), (test) => test.id);
});

// Tests
describe('useAegisList', () => {
  it('should return current item status', () => {
    const list$ = useAegisList(entity.$list('test'));
    const isLoading$ = computed(() => list$.value.isLoading);
    const data$ = computed(() => list$.value.data);

    expect(isLoading$.value).toBe(false);
    expect(data$.value).toEqual([]);

    // Update item
    entity.$list('test').data = [{ id: 'test-1', success: true }];

    expect(isLoading$.value).toBe(false);
    expect(data$.value).toEqual( [{ id: 'test-1', success: true }]);
  });

  it('should register new listeners if item changes', () => {
    entity.$list('test-2').data = [{ id: 'test', success: true }];

    // First item
    const key$ = ref('test-1');
    const item$ = useAegisList(computed(() => entity.$list(key$.value)));
    const data$ = computed(() => item$.value.data);

    expect(item$.value.$key).toBe('test-1');
    expect(data$.value).toEqual([]);

    // Change item
    key$.value = 'test-2';

    expect(item$.value.$key).toBe('test-2');
    expect(data$.value).toEqual([{ id: 'test', success: true }]);

    // Update item
    entity.$list('test-2').data = [{ id: 'test', success: false }];

    expect(data$.value).toEqual([{ id: 'test', success: false }]);
  });
});
