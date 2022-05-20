import { AegisQuery } from './query';

// Types
export type AegisSender<T, A extends unknown[]> = (args: A) => AegisQuery<T>;
