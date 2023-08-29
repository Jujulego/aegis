import { IAsyncMutable, IAsyncReadable, IMutable, IReadable, ISyncMutable, ISyncReadable } from '../defs/index.js';
import { isPromise } from '../utils/promise.js';
import { Ref, ref$ } from './ref.js';

// Types
export type MutableRef<D, A = D, R extends IReadable<D> = IReadable<D>, M extends IMutable<D, A> = IMutable<D, A>> = Ref<D, R> & M;
export type SyncMutableRef<D, A = D> = MutableRef<D, A, ISyncReadable<D>, ISyncMutable<D, A>>;
export type AsyncMutableRef<D, A = D> = MutableRef<D, A, IAsyncReadable<D>, IAsyncMutable<D, A>>;

// Builder
export function mutable$<D, A = D>(opts: IAsyncReadable<D> & IAsyncMutable<D, A>): AsyncMutableRef<D, A>;
export function mutable$<D, A = D>(opts: IAsyncReadable<D> & ISyncMutable<D, A>): MutableRef<D, A, IAsyncReadable<D>, ISyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: IAsyncReadable<D> & IMutable<D, A>): MutableRef<D, A, IAsyncReadable<D>, IMutable<D, A>>;

export function mutable$<D, A = D>(opts: ISyncReadable<D> & IAsyncMutable<D, A>): MutableRef<D, A, ISyncReadable<D>, IAsyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: ISyncReadable<D> & ISyncMutable<D, A>): SyncMutableRef<D, A>;
export function mutable$<D, A = D>(opts: ISyncReadable<D> & IMutable<D, A>): MutableRef<D, A, ISyncReadable<D>, IMutable<D, A>>;

export function mutable$<D, A = D>(opts: IReadable<D> & IAsyncMutable<D, A>): MutableRef<D, A, IReadable<D>, IAsyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: IReadable<D> & ISyncMutable<D, A>): MutableRef<D, A, IReadable<D>, ISyncMutable<D, A>>;
export function mutable$<D, A = D>(opts: IReadable<D> & IMutable<D, A>): MutableRef<D, A>;

export function mutable$<D, A = D>(opts: IReadable<D> & IMutable<D, A>): MutableRef<D, A> {
  const ref = ref$<D>(opts.read);

  function emit(val: D) {
    ref.next(val);
    return val;
  }

  return Object.assign(ref, {
    mutate(arg: A) {
      const val = opts.mutate(arg);

      if (isPromise(val)) {
        return val.then(emit);
      } else {
        return emit(val);
      }
    }
  });
}
