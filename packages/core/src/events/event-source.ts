import { ExtractKey, KeyTree, PartialKey } from '../utils';

import {
  EventData,
  EventEmitter,
  EventType,
  EventListener,
  EventListenerOptions,
  EventMap,
  EventOptions,
  EventUnsubscribe,
  EventPromise
} from './types';

// Class
export class EventSource<M extends EventMap> implements EventEmitter<M> {
  // Attributes
  readonly controller?: AbortController;
  private readonly _listeners = new KeyTree();

  // Emit
  emit<T extends EventType<M>>(type: T, data: EventData<M, T>, opts?: EventOptions): void {
    for (const listener of this._listeners.searchWithParent(type)) {
      (listener as EventListener<M, T>)(data, { type, source: opts?.source ?? this });
    }
  }

  subscribe<T extends PartialKey<EventType<M>>>(
    type: T,
    listener: EventListener<M, ExtractKey<EventType<M>, T>>,
    opts: EventListenerOptions = {},
  ): EventUnsubscribe {
    opts.signal ??= this.controller?.signal;

    this._listeners.insert(type, listener);

    if (opts.signal) {
      opts.signal.addEventListener('abort', () => this._listeners.remove(listener), { once: true });
    }

    return () => this._listeners.remove(listener);
  }

  waitFor<T extends PartialKey<EventType<M>>>(
    type: T,
    opts: EventListenerOptions = {}
  ): EventPromise<M, ExtractKey<EventType<M>, T>> {
    opts.signal ??= this.controller?.signal;

    return new Promise((resolve, reject) => {
      const unsub = this.subscribe(type, (data, metadata) => {
        resolve([data, metadata]);
        unsub();
      }, opts);

      if (opts.signal) {
        opts.signal.addEventListener('abort', () => reject(opts.signal!.reason), { once: true });
      }
    });
  }
}
