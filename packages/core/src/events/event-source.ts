import { Event, EventListener, ExtractEvent } from './event';
import { ComposedKeyTree } from '../utils';

// Types
export type EventUnsubscribe = () => void;

export interface EventOptions {
  key?: string[];
}

export interface EventListenerOptions {
  key?: string[];
  signal?: AbortSignal;
}

// Class
export class EventSource<E extends Event> {
  // Attributes
  readonly controller?: AbortController;
  private readonly _listeners = new ComposedKeyTree<EventListener, [E['type'], ...string[]]>();

  // Emit
  emit<T extends E['type']>(type: T, data: ExtractEvent<E, T>['data'], opts: EventOptions = {}): void {
    for (const listener of this._listeners.searchWithParent(opts.key ? [type, ...opts.key] : [type])) {
      listener({
        type,
        data,
        key: opts.key,
        source: this,
      });
    }
  }

  subscribe<T extends E['type']>(type: T, listener: EventListener<ExtractEvent<E, T>>, opts: EventListenerOptions = { signal: this.controller?.signal }): EventUnsubscribe {
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
