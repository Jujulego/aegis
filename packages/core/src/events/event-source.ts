import { Event, EventListener, ExtractEvent } from './event';
import { ComposedKeyTree } from '../utils';

// Types
export type EventUnsubscribe = () => void;

export interface EventOptions {
  target?: string;
}

export interface EventListenerOptions {
  target?: string;
}

// Class
export class EventSource<E extends Event> {
  // Attributes
  private readonly _listeners = new ComposedKeyTree<EventListener, [E['type'], string]>();

  // Emit
  emit<T extends E['type']>(type: T, data: ExtractEvent<E, T>['data'], opts: EventOptions = {}): void {
    for (const listener of this._listeners.searchWithParent(opts.target ? [type, opts.target] : [type])) {
      listener({
        type,
        data,
        target: opts.target,
        source: this,
      });
    }
  }

  subscribe<T extends E['type']>(type: T, listener: EventListener<ExtractEvent<E, T>>, opts: EventListenerOptions = {}): EventUnsubscribe {
    if (opts.target) {
      this._listeners.insert([type, opts.target], listener);
    } else {
      this._listeners.insert([type], listener);
    }

    return () => this._listeners.remove(listener);
  }
}
