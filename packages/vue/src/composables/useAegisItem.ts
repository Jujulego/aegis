import { AegisUnknownItem } from '@jujulego/aegis';
import {
  computed,
  ComputedRef,
  Ref,
  shallowRef,
  triggerRef,
  watchEffect,
  WritableComputedRef
} from '@vue/composition-api';

// Types
export interface AegisItemState<T> {
  isLoading$: ComputedRef<boolean>;
  data$: WritableComputedRef<T | undefined>;
}

// Composables
export function useAegisItem<T>(item: AegisUnknownItem<T> | Ref<AegisUnknownItem<T>>): AegisItemState<T> {
  const item$ = shallowRef(item);

  // Initiate refs
  const isLoading$ = computed(() => item$.value.isLoading);
  const data$ = computed({
    get: () => item$.value.data,
    set(val) {
      item$.value.data = val;
    }
  });

  // Watch on effects
  watchEffect((cleanUp) => {
    cleanUp(item$.value.subscribe('status', () => {
      triggerRef(isLoading$);
    }));
  });

  watchEffect((cleanUp) => {
    cleanUp(item$.value.subscribe('update', () => {
      triggerRef(data$);
    }));
  });

  return {
    isLoading$,
    data$,
  };
}
