import { off$, Observable as Obs, Emitter, ObservedValue, OffGroup } from '@jujulego/event-tree';

import { PipeOperator } from './defs/index.js';

// Builder
type PO<A extends Obs, B extends Obs> = PipeOperator<A, B>;
type Rcv<A extends Obs> = Emitter<ObservedValue<A>>;

export function flow$<A extends Obs>(obs: A, rcv: Rcv<A>): OffGroup;
export function flow$<A extends Obs, B extends Obs>(obs: A, opA: PO<A, B>, rcv: Rcv<B>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, rcv: Rcv<C>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs, D extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, rcv: Rcv<D>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, rcv: Rcv<E>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, rcv: Rcv<F>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, rcv: Rcv<G>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs, H extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, rcv: Rcv<H>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs, H extends Obs, I extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>, rcv: Rcv<I>): OffGroup;
export function flow$<A extends Obs, B extends Obs, C extends Obs, D extends Obs, E extends Obs, F extends Obs, G extends Obs, H extends Obs, I extends Obs, J extends Obs>(obs: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>, opI: PO<I, J>, rcv: Rcv<J>): OffGroup;

export function flow$(obs: Obs, ...rest: [...PipeOperator<Obs, Obs>[], rcv: Emitter]): OffGroup {
  const rcv = rest.pop() as Emitter;
  const ops = rest as PipeOperator<Obs, Obs>[];

  const off = off$();
  const out = ops.reduce((step, op) => op(step, { off }), obs);
  off.add(out.subscribe(rcv.next));

  return off;
}
