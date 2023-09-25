import { OffGroup, Observable as Obs } from '@jujulego/event-tree';

export interface PipeContext {
  off: OffGroup;
}

export type PipeOperator<A extends Obs, B extends Obs> = (arg: A, context: PipeContext) => B;

export type PipeOff<R extends Obs = Obs> = R & {
  off(): void;
}
