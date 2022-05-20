// Interface
export interface AegisStore {
  // Methods
  get<T>(entity: string, id: string): T | undefined;
  set<T>(entity: string, id: string, data: T): void;
  delete<T>(entity: string, id: string): void;
}
