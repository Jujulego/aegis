// Types
interface QueryStatePending {
  readonly status: 'pending';
}

interface QueryStateCompleted<T> {
  readonly status: 'completed';
  readonly data: T;
}

interface QueryStateError {
  readonly status: 'error';
  readonly data: Error;
}

export type QueryState<T> = QueryStatePending | QueryStateCompleted<T> | QueryStateError;
export type QueryStatus = QueryState<unknown>['status'];
