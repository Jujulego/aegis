import { AegisList } from '@jujulego/aegis';
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
export interface AegisListState<T> {
  isLoading$: ComputedRef<boolean>;
  data$: WritableComputedRef<T[]>;
}

// Composables
export function useAegisList<T>(list: AegisList<T> | Ref<AegisList<T>>): AegisListState<T> {
  const list$ = shallowRef(list);

  // Initiate refs
  const isLoading$ = computed(() => list$.value.isLoading);
  const data$ = computed({
    get: () => list$.value.data,
    set(val) {
      list$.value.data = val;
    }
  });

  // Watch on effects
  watchEffect((cleanUp) => {
    cleanUp(list$.value.subscribe('status', () => {
      triggerRef(isLoading$);
    }));
  });

  watchEffect((cleanUp) => {
    cleanUp(list$.value.subscribe('update', () => {
      triggerRef(isLoading$);
    }));
  });

  return {
    isLoading$,
    data$,
  };
}
