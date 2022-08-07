import { $entity, $mutation, $store, AegisEntity, Query } from '@jujulego/aegis';
import VueCompositionAPI, { computed } from '@vue/composition-api';
import Vue from 'vue';

import { useAegisMutation } from '../../src';

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
describe('useAegisMutation', () => {
  it('should return current mutation status', () => {
    const query = new Query<Test>();
    const list$ = useAegisMutation($mutation(entity.$entity, query));
    const isLoading$ = computed(() => list$.value.isLoading);
    const result$ = computed(() => list$.value.result);

    expect(isLoading$.value).toBe(true);
    expect(result$.value).toBeUndefined();

    // Complete query
    query.complete({ id: 'test', success: true });

    expect(isLoading$.value).toBe(false);
    expect(result$.value).toEqual( { id: 'test', success: true });
  });
});
