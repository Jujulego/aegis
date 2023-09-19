import { Observable as Obs, Source, source$ } from '@jujulego/event-tree';

import { PipeOperator } from '../pipe.js';

// Operator
export function filter$<DA, DB extends DA>(fn: (arg: DA) => arg is DB): PipeOperator<Obs<DA>, Source<DB>>;

export function filter$<D>(fn: (arg: D) => boolean): PipeOperator<Obs<D>, Source<D>>;

export function filter$<D>(fn: (arg: D) => boolean): PipeOperator<Obs<D>, Source<D>> {
  return (obs: Obs<D>, { off }) => {
    const out = source$<D>();

    off.add(obs.subscribe((data) => {
      if (fn(data)) {
        out.next(data);
      }
    }));

    return out;
  };
}