import { AegisUnknownItem } from '@jujulego/aegis';
import { ref, UnwrapRef, watchEffect } from '@vue/composition-api';

// Composables
export function useAegisItem<T, I extends AegisUnknownItem<T>>(item: I) {
  const isLoading$ = ref(item.isLoading);
  const data$ = ref(item.data);

  watchEffect((cleanUp) => {
    cleanUp(item.subscribe('update', (update) => {
      data$.value = update.new as UnwrapRef<T>;
    }));
  });

  watchEffect((cleanUp) => {
    cleanUp(item.subscribe('status', (update) => {
      isLoading$.value = update.status === 'pending';
    }));
  });

  return {
    isLoading$,
    data$,
  };
}
