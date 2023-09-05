import { offGroup, OffGroup } from '@jujulego/event-tree';

import { Ref } from '../refs/index.js';

// Types
export interface PipeContext {
  off: OffGroup;
}

export type StepRef<D = unknown> = Ref<D>;

export type PipeOperator<A extends StepRef, B extends StepRef> = (arg: A, context: PipeContext) => B;
export type PipeRef<R extends StepRef> = R & {
  off(): void;
}

// Builder
type SR = StepRef;
type PO<A extends SR, B extends SR> = PipeOperator<A, B>;

export function pipe$<A extends SR>(ref: A): PipeRef<A>;
export function pipe$<A extends SR, B extends SR>(ref: A, opA: PO<A, B>): PipeRef<B>;
export function pipe$<A extends SR, B extends SR, C extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>): PipeRef<C>;
export function pipe$<A extends SR, B extends SR, C extends SR, D extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>): PipeRef<D>;
export function pipe$<A extends SR, B extends SR, C extends SR, D extends SR, E extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>): PipeRef<E>;
export function pipe$<A extends SR, B extends SR, C extends SR, D extends SR, E extends SR, F extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>): PipeRef<F>;
export function pipe$<A extends SR, B extends SR, C extends SR, D extends SR, E extends SR, F extends SR, G extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>): PipeRef<G>;
export function pipe$<A extends SR, B extends SR, C extends SR, D extends SR, E extends SR, F extends SR, G extends SR, H extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>): PipeRef<H>;
export function pipe$<A extends SR, B extends SR, C extends SR, D extends SR, E extends SR, F extends SR, G extends SR, H extends SR, I extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>): PipeRef<I>;
export function pipe$<A extends SR, B extends SR, C extends SR, D extends SR, E extends SR, F extends SR, G extends SR, H extends SR, I extends SR, J extends SR>(ref: A, opA: PO<A, B>, opB: PO<B, C>, opC: PO<C, D>, opD: PO<D, E>, opE: PO<E, F>, opF: PO<F, G>, opG: PO<G, H>, opH: PO<H, I>, opI: PO<I, J>): PipeRef<J>;

export function pipe$(ref: StepRef, ...ops: PipeOperator<StepRef, StepRef>[]): PipeRef<StepRef> {
  const off = offGroup();
  const out = ops.reduce((step, op) => op(step, { off }), ref);

  return Object.assign(out, { off });
}
