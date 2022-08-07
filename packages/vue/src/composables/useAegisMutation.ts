import { AegisUnknownMutation } from '@jujulego/aegis';
import { computed, ref, Ref, shallowRef, watchEffect } from '@vue/composition-api';

// Composables
export function useAegisMutation<M extends AegisUnknownMutation<any>>(mutation: M | Ref<M>): Ref<M> {
  const mutation$ = shallowRef(mutation);
  const trigger$ = ref(1);

  // Watch on events
  watchEffect((cleanUp) => {
    cleanUp(mutation$.value.subscribe('status', () => {
      trigger$.value++;
    }));
  }, { flush: 'sync' });

  return computed(() => {
    return (trigger$.value && mutation$.value) as M;
  });
}
