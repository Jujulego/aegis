import { TypedEvent, TypedEventListener, TypedEventTarget } from '@jujulego/aegis-core';

// Utils
export function eventSubscriber<E extends TypedEvent, T extends E['type']>(emitter: TypedEventTarget<E>, type: T) {
  return (listener: TypedEventListener<Extract<E, TypedEvent<T>>>) => {
    emitter.addEventListener(type, listener);
    return () => emitter.removeEventListener(type, listener);
  };
}
