import { ObservedValue } from '@jujulego/event-tree';
import { Immer, produce } from 'immer';

import { ActionReducers, ActionRef, SymmetricRef } from './defs/index.js';
import { awaitedCall } from './utils/promise.js';

export interface ActionsOpts {
  /**
   * Custom instance of Immer to use. By default, it will use the global instance.
   */
  immer?: Immer;
}

/**
 * Wrap a reference, adding some methods to modify stored data.
 *
 * Based on [immer](https://immerjs.github.io/immer/), those methods should return a reducer receiving current stored data.
 * Then they can modify the data in place. Immer will produce an updated data objet that will be given to ref's mutate method
 * to store the changes.
 *
 * @param ref reference to wrap (must be a symmetric reference)
 * @param actions actions reducers
 * @param opts
 *
 * @example
 * const counter = action$(var$({ count: 1 }), {
 *   add: (i: number) => (old) => {
 *     old.count += i;
 *   },
 *   reset: () => (old) => {
 *     old.count = 0;
 *   },
 * });
 *
 * counter.add(1); // <= this will increment count by 1
 * counter.reset(); // <= this will reset count to 0
 */
export function actions$<R extends SymmetricRef, A extends ActionReducers<ObservedValue<R>>>(ref: R, actions: A, opts: ActionsOpts = {}): ActionRef<R, A> {
  const { immer } = opts;

  for (const [key, act] of Object.entries(actions)) {
    Object.assign(ref, {
      [key]: (...params: unknown[]) => awaitedCall(
        (result) => ref.mutate(result),
        awaitedCall(
          (old) => (immer?.produce ?? produce)(old, act(...params)),
          ref.read()
        )
      ),
    });
  }

  return ref as ActionRef<R, A>;
}
