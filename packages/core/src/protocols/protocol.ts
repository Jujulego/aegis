import { AegisQuery } from './query';

// Types
export type AegisQueryItem<T> = (id: string) => AegisQuery<T>;
