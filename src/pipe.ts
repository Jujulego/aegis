import { off$, OffGroup, Source as Src } from '@jujulego/event-tree';

// Types
export interface PipeContext {
  off: OffGroup;
}

export type PipeOperator<A extends Src, B extends Src> = (arg: A, context: PipeContext) => B;
export type PipeSource<R extends Src = Src> = R & {
  off(): void;
}

// Builder
type PO<A extends Src, B extends Src> = PipeOperator<A, B>;

export function pipe$<A extends Src>(src: A): PipeSource<A>;
export function pipe$<A extends Src, B extends Src>(src: A, opA: PO<A, B>): PipeSource<B>;
export function pipe$<A extends Src, B extends Src, C extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>): PipeSource<C>;
export function pipe$<A extends Src, B extends Src, C extends Src, D extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>): PipeSource<D>;
export function pipe$<A extends Src, B extends Src, C extends Src, D extends Src, E extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>): PipeSource<E>;
export function pipe$<A extends Src, B extends Src, C extends Src, D extends Src, E extends Src, F extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>): PipeSource<F>;
export function pipe$<A extends Src, B extends Src, C extends Src, D extends Src, E extends Src, F extends Src, G extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>): PipeSource<G>;
export function pipe$<A extends Src, B extends Src, C extends Src, D extends Src, E extends Src, F extends Src, G extends Src, H extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>): PipeSource<H>;
export function pipe$<A extends Src, B extends Src, C extends Src, D extends Src, E extends Src, F extends Src, G extends Src, H extends Src, I extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>): PipeSource<I>;
export function pipe$<A extends Src, B extends Src, C extends Src, D extends Src, E extends Src, F extends Src, G extends Src, H extends Src, I extends Src, J extends Src>(src: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>, opI: PO<I, J>): PipeSource<J>;

export function pipe$(src: Src, ...ops: PipeOperator<Src, Src>[]): PipeSource {
  const off = off$();
  const out = ops.reduce((step, op) => op(step, { off }), src);

  return Object.assign(out, { off });
}
