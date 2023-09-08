import { MapMutateArg, MapReadValue } from '../defs/index.js';
import { Ref } from './ref.js';
import { MutableRef } from './mutable.js';

/**
 * Build a Ref type with the same synchronicity and the given value type
 */
export type MapRefValue<R extends Ref, D> = Ref<D, MapReadValue<R, D>>;

/**
 * Build a Mutable type with the same synchronicity and the given value types
 */
export type MapMutableValue<R extends MutableRef, D, A> = MutableRef<D, A, MapReadValue<R, D>, MapMutateArg<R, D, A>>;
