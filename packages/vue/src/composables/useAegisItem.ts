import { AegisItem, EventUnsubscribe } from '@jujulego/aegis-core';
import { onUnmounted, ref, UnwrapRef, watch } from '@vue/composition-api';

// Composables
export function useAegisItem<T>(item: AegisItem<T>) {
  const status$ = ref(item.status);
  const data$ = ref(item.data);

  let unsub: EventUnsubscribe;

  watch(item, () => {
    if (unsub) unsub();

    unsub = item.subscribe('update', (update) => {
      data$.value = update.new as UnwrapRef<T>;
    });
  });

  onUnmounted(() => {
    unsub();
  });

  item.subscribe('query', (update) => {
    status$.value = update.new.status;
  });

  return {
    status$,
    data$,
  };
}
