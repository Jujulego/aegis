import { AegisList } from '@jujulego/aegis';
import { computed, ref, Ref, shallowRef, watchEffect } from '@vue/composition-api';

// Composables
export function useAegisList<L extends AegisList<any>>(list: L | Ref<L>): Ref<L> {
  const list$ = shallowRef(list);
  const trigger$ = ref(1);

  // Watch on effects
  watchEffect((cleanUp) => {
    cleanUp(list$.value.subscribe('status', () => {
      trigger$.value++;
    }));
  }, { flush: 'sync' });

  watchEffect((cleanUp) => {
    cleanUp(list$.value.subscribe('update', () => {
      trigger$.value++;
    }));
  }, { flush: 'sync' });

  return computed(() => {
    return (trigger$.value && list$.value) as L;
  });
}
