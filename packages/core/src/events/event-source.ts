import { Event, EventListener, ExtractEvent } from './event';

// Types
export type EventUnsubscribe = () => void;

// Class
export class EventSource<E extends Event> {
  // Attributes
  private readonly _listeners = new Map<E['type'], Set<EventListener>>();

  // Emit
  private _getListenersFor(type: E['type']): Set<EventListener> {
    let listeners = this._listeners.get(type);

    if (!listeners) {
      listeners = new Set();
      this._listeners.set(type, listeners);
    }

    return listeners;
  }

  emit<T extends E['type']>(type: T, data: ExtractEvent<E, T>['data']): void {
    for (const listener of this._getListenersFor(type)) {
      listener({
        type,
        data,
        source: this,
      });
    }
  }

  subscribe<T extends E['type']>(type: T, listener: EventListener<ExtractEvent<E, T>>): EventUnsubscribe {
    const listeners = this._getListenersFor(type);
    listeners.add(listener);

    return () => listeners.delete(listener);
  }
}
