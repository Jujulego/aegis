import { Observable as Obs, ObservedValue } from '@jujulego/event-tree';
import { PipeOperator } from '../pipe.js';

// Operator
export function tap$<A extends Obs>(fn: (arg: ObservedValue<A>) => void): PipeOperator<A, A>;

export function tap$<D>(fn: (arg: D) => void): PipeOperator<Obs<D>, Obs<D>> {
  return (obs: Obs<D>, { off }) => {
    off.add(obs.subscribe(fn));

    return obs;
  };
}
