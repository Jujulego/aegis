// Types
export interface DataAccessor<D> {
  isEmpty?: () => boolean;
  read(): D | undefined;
  update(data: D): void;
}
