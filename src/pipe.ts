import { offGroup, OffGroup } from '@jujulego/event-tree';

import { Ref } from './refs/index.js';

// Types
export interface PipeContext {
  off: OffGroup;
}

export type PipeOperator<A extends Ref, B extends Ref> = (arg: A, context: PipeContext) => B;
export type PipeRef<R extends Ref = Ref> = R & {
  off(): void;
}

// Builder
type PO<A extends Ref, B extends Ref> = PipeOperator<A, B>;

export function pipe$<A extends Ref>(ref: A): PipeRef<A>;
export function pipe$<A extends Ref, B extends Ref>(ref: A, opA: PO<A, B>): PipeRef<B>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>): PipeRef<C>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref, D extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>): PipeRef<D>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref, D extends Ref, E extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>): PipeRef<E>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref, D extends Ref, E extends Ref, F extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>): PipeRef<F>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref, D extends Ref, E extends Ref, F extends Ref, G extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>): PipeRef<G>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref, D extends Ref, E extends Ref, F extends Ref, G extends Ref, H extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>): PipeRef<H>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref, D extends Ref, E extends Ref, F extends Ref, G extends Ref, H extends Ref, I extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>): PipeRef<I>;
export function pipe$<A extends Ref, B extends Ref, C extends Ref, D extends Ref, E extends Ref, F extends Ref, G extends Ref, H extends Ref, I extends Ref, J extends Ref>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>, opI: PO<I, J>): PipeRef<J>;

export function pipe$(ref: Ref, ...ops: PipeOperator<Ref, Ref>[]): PipeRef {
  const off = offGroup();
  const out = ops.reduce((step, op) => op(step, { off }), ref);

  return Object.assign(out, { off });
}
