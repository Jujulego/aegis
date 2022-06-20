import { Event, EventKey, EventListener, ExtractEvent } from './event';
import { ComposedKeyTree, PartialKey } from '../utils';

// Types
export type EventUnsubscribe = () => void;

export interface EventOptions<E extends Event> {
  key?: PartialKey<EventKey<E>>;
}

export interface EventListenerOptions<E extends Event> {
  key?: PartialKey<EventKey<E>>;
  signal?: AbortSignal;
}

// Class
export class EventSource<E extends Event> {
  // Attributes
  readonly controller?: AbortController;
  private readonly _listeners = new ComposedKeyTree<EventListener, [E['type'], ...string[]]>();

  // Emit
  emit<T extends E['type']>(type: T, data: ExtractEvent<E, T>['data'], opts: EventOptions<ExtractEvent<E, T>> = {}): void {
    for (const listener of this._listeners.searchWithParent(opts.key ? [type, ...opts.key] : [type])) {
      listener({
        type,
        data,
        key: opts.key,
        source: this,
      });
    }
  }

  subscribe<T extends E['type']>(
    type: T,
    listener: EventListener<ExtractEvent<E, T>>,
    opts: EventListenerOptions<ExtractEvent<E, T>> = { signal: this.controller?.signal }
  ): EventUnsubscribe {
    if (opts.key) {
      this._listeners.insert([type, ...opts.key], listener);
    } else {
      this._listeners.insert([type], listener);
    }

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => this._listeners.remove(listener), { once: true });
    }

    return () => this._listeners.remove(listener);
  }
}
