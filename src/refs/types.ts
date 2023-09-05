import { MapReadValue } from '../defs/index.js';
import { Ref } from './ref.js';

/**
 * Build a Ref type with the same synchronicity and the given value type
 */
export type MapRefValue<R extends Ref, D> = Ref<D, MapReadValue<R, D>>;
