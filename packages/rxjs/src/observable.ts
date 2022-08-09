import { AegisList, AegisUnknownItem, AegisUnknownMutation } from '@jujulego/aegis';
import { Observable } from 'rxjs';

// Observable
export const $observable = {
  item<T>(item: AegisUnknownItem<T>): Observable<T> {
    return new Observable((subscriber) => {
      // Emit initial state
      if (item.data !== undefined) {
        subscriber.next(item.data);
      }

      // Subscribe to events
      const unsub = item.subscribe('update', (event) => {
        subscriber.next(event.new);
      });

      subscriber.add(unsub);
    });
  },
  list<T>(list: AegisList<T>): Observable<T[]> {
    return new Observable((subscriber) => {
      // Emit initial state
      subscriber.next(list.data);

      // Subscribe to events
      const unsub = list.subscribe('update', (event) => {
        subscriber.next(event);
      });

      subscriber.add(unsub);
    });
  },
  mutation<T, M extends AegisUnknownMutation<T>>(mutation: M): Observable<T> {
    return new Observable((subscriber) => {
      const unsub = mutation.subscribe('status', (event) => {
        if (event.status === 'completed') {
          subscriber.next(event.result);
          subscriber.complete();
        } else {
          subscriber.error(event.error);
        }
      });

      subscriber.add(unsub);
    });
  },
};
