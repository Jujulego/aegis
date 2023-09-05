import { ReadValue } from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
import { AsyncRef, Ref, ref$ } from '../refs/index.js';
import { awaitedCall } from '../utils/promise.js';
import { MapRefValue } from '../refs/types.js';

// Operator
export function each$<A extends Ref, B>(fn: (val: ReadValue<A>) => PromiseLike<B>): PipeOperator<A, AsyncRef<B>>;
export function each$<A extends Ref, B>(fn: (val: ReadValue<A>) => B): PipeOperator<A, MapRefValue<A, B>>;

export function each$<A, B>(fn: (val: A) => B): PipeOperator<Ref<A>, Ref<B>> {
  return (ref: Ref<A>, { off }) => {
    const out = ref$<B>(() => awaitedCall<A, B>(ref.read(), fn));
    off.add(ref.subscribe((data) => awaitedCall(fn(data), out.next)));

    return out;
  };
}
