// Interface
export interface Store {
  // Methods
  get<T>(entity: string, id: string): T | undefined;
  update<T>(entity: string, id: string, data: T): T;
}
