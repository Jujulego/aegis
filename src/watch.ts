import { OffFn } from '@jujulego/event-tree';

import { Ref } from './defs/index.js';

// Types
export type WatchCleanUp = () => void;
export type WatchFn<D> = (data: D) => WatchCleanUp | undefined;

// Operator
export function watch$<D>(ref: Ref<D>, fn: WatchFn<D>): OffFn {
  let cleanUp: WatchCleanUp | undefined;

  return ref.subscribe((data: D) => {
    if (cleanUp) {
      cleanUp();
    }

    cleanUp = fn(data);
  });
}
