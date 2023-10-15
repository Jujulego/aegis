import { SyncMutableRef, SyncRef } from './defs/index.js';

// Types
export type BindDecorator<V> = <T>(target: ClassAccessorDecoratorTarget<T, V>, ctx: ClassAccessorDecoratorContext<T, V>) => ClassAccessorDecoratorResult<T, V>;

// Decorator
export function BindRef<V, D extends V>(ref: SyncRef<D> | SyncMutableRef<D>): BindDecorator<V> {
  return (_, ctx) => {
    const result: ClassAccessorDecoratorResult<unknown, D> = {
      get: ref.read,
    };

    if ('mutate' in ref) {
      result.set = ref.mutate;
    } else {
      result.set = () => {
        throw new Error(`Cannot set ${String(ctx.name)}, it is bound to a readonly reference.`);
      };
    }

    return result;
  };
}