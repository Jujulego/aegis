import { $entity, $store, AegisEntity } from '@jujulego/aegis';
import VueCompositionAPI, { computed, ref } from '@vue/composition-api';
import Vue from 'vue';

import { useAegisItem } from '../../src';

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
describe('useAegisItem', () => {
  it('should return current item status', () => {
    const item$ = useAegisItem(entity.$item('test'));
    const isLoading$ = computed(() => item$.value.isLoading);
    const data$ = computed(() => item$.value.data);

    expect(isLoading$.value).toBe(false);
    expect(data$.value).toBeUndefined();

    // Update item
    entity.$item('test').data = { id: 'test', success: true };

    expect(isLoading$.value).toBe(false);
    expect(data$.value).toEqual( { id: 'test', success: true });
  });

  it.only('should register new listeners if item changes', () => {
    entity.$item('test-2').data = { id: 'test-2', success: true };

    // First item
    const id$ = ref('test-1');
    const item$ = useAegisItem(computed(() => entity.$item(id$.value)));
    const data$ = computed(() => item$.value.data);

    expect(item$.value.$id).toBe('test-1');
    expect(data$.value).toBeUndefined();

    // Change item
    id$.value = 'test-2';

    expect(item$.value.$id).toBe('test-2');
    expect(data$.value).toEqual( { id: 'test-2', success: true });

    // Update item
    entity.$item('test-2').data = { id: 'test-2', success: false };

    expect(data$.value).toEqual( { id: 'test-2', success: false });
  });
});
