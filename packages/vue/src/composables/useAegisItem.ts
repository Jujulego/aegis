import { AegisUnknownItem } from '@jujulego/aegis';
import { computed, ref, Ref, shallowRef, watchEffect } from '@vue/composition-api';

// Composables
export function useAegisItem<I extends AegisUnknownItem<any>>(item: I | Ref<I>): Ref<I> {
  const item$ = shallowRef(item);
  const trigger$ = ref(1);

  // Watch on events
  watchEffect((cleanUp) => {
    cleanUp(item$.value.subscribe('status', () => {
      trigger$.value++;
    }));
  }, { flush: 'sync' });

  watchEffect((cleanUp) => {
    cleanUp(item$.value.subscribe('update', () => {
      trigger$.value++;
    }));
  }, { flush: 'sync' });

  return computed(() => {
    return (trigger$.value && item$.value) as I;
  });
}
