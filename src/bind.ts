import { SyncMutableRef } from './defs/index.js';

// Types
export type BindDecorator<D> = <T>(target: ClassAccessorDecoratorTarget<T, D>, ctx: ClassAccessorDecoratorContext<T, D>) => ClassAccessorDecoratorResult<T, D>;

// Decorator
export function bind$<D>(ref: SyncMutableRef<D>): BindDecorator<D> {
  return () => {
    return {
      get(): D {
        return ref.read();
      },
      set(value: D) {
        ref.mutate(value);
      },
    };
  };
}