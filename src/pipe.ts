import { off$, Observable as Obs } from '@jujulego/event-tree';

import { PipeOff, PipeOperator } from './defs/index.js';

// Builder
type PO<A extends Obs, B extends Obs> = PipeOperator<A, B>;

export function pipe$<A extends Obs>(obs: A): PipeOff<A>;
export function pipe$<A extends Obs, B extends Obs>(obs: A, opA: PO<A, B>): PipeOff<B>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>): PipeOff<C>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs, D extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>): PipeOff<D>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>): PipeOff<E>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>): PipeOff<F>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>): PipeOff<G>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs, H extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>): PipeOff<H>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs, H extends Obs, I extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>): PipeOff<I>;
export function pipe$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs, H extends Obs, I extends Obs, J extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>, opI: PO<I, J>): PipeOff<J>;

export function pipe$<O extends Obs>(obs: O, ...ops: PipeOperator<O, O>[]): PipeOff<O>;

export function pipe$(obs: Obs, ...ops: PipeOperator<Obs, Obs>[]): PipeOff {
  const off = off$();
  const out = ops.reduce((step, op) => op(step, { off }), obs);

  return Object.assign(out, { off });
}
