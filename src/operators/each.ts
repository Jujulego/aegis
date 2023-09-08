import { ReadValue } from '../defs/index.js';
import { PipeOperator } from '../pipe.js';
import { AsyncRef, Ref, ref$ } from '../refs/index.js';
import { awaitedCall } from '../utils/promise.js';
import { MapRefValue } from '../refs/types.js';

// Operator
export function each$<R extends Ref, D>(fn: (val: ReadValue<R>) => PromiseLike<D>): PipeOperator<R, AsyncRef<D>>;
export function each$<R extends Ref, D>(fn: (val: ReadValue<R>) => D): PipeOperator<R, MapRefValue<R, D>>;

export function each$<DA, DB>(fn: (val: DA) => DB): PipeOperator<Ref<DA>, Ref<DB>> {
  return (ref: Ref<DA>, { off }) => {
    const out = ref$<DB>(() => awaitedCall<DA, DB>(ref.read(), fn));
    off.add(ref.subscribe((data) => awaitedCall(fn(data), out.next)));

    return out;
  };
}
