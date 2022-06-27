import { KeyTree, PartialKey, StringKey } from '../utils';

import { EventData, EventEmitter, EventKey, EventListener, EventListenerOptions, EventMap, EventOptions, EventUnsubscribe } from './types';

// Class
export class EventSource<M extends EventMap> implements EventEmitter<M> {
  // Attributes
  readonly controller?: AbortController;
  private readonly _listeners = new KeyTree();

  // Emit
  emit<T extends keyof M & string>(key: StringKey<EventKey<M, T>>, data: EventData<M, T>, opts?: EventOptions): void {
    const _key = key.split('.') as EventKey<M, T>;
    const [type, ...filters] = _key;

    for (const listener of this._listeners.searchWithParent(_key)) {
      (listener as EventListener<M, T>)(data, { type, filters, source: opts?.source ?? this as EventEmitter });
    }
  }

  subscribe<T extends keyof M & string>(
    key: StringKey<PartialKey<EventKey<M, T>>>,
    listener: EventListener<M, T>,
    opts: EventListenerOptions = {},
  ): EventUnsubscribe {
    opts.signal ??= this.controller?.signal;

    this._listeners.insert(key.split('.'), listener);

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => this._listeners.remove(listener), { once: true });
    }

    return () => this._listeners.remove(listener);
  }
}
