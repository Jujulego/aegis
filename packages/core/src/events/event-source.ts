import { KeyTree, PartialKey } from '../utils';

import { Event, EventKey, EventListener, ExtractEvent } from './event';
import { EventEmitter, EventListenerOptions, EventUnsubscribe } from './event-emitter';

// Types
export interface EventOptions<E extends Event> {
  key?: PartialKey<EventKey<E>>;
  source?: EventSource<Event>;
}

// Class
export class EventSource<E extends Event> implements EventEmitter<E> {
  // Attributes
  readonly controller?: AbortController;
  private readonly _listeners = new KeyTree<EventListener, [E['type'], ...string[]]>();

  // Emit
  emit<T extends E['type']>(type: T, data: ExtractEvent<E, T>['data'], opts: EventOptions<ExtractEvent<E, T>> = {}): void {
    for (const listener of this._listeners.searchWithParent(opts.key ? [type, ...opts.key] : [type])) {
      listener({
        type,
        data,
        key: opts.key,
        source: opts.source ?? this,
      });
    }
  }

  subscribe<T extends E['type']>(
    type: T,
    listener: EventListener<ExtractEvent<E, T>>,
    opts: EventListenerOptions<ExtractEvent<E, T>> = {}
  ): EventUnsubscribe {
    opts.signal ??= this.controller?.signal;

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
