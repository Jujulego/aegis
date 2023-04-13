import { DataAccessor } from './types';

// Class
export class DVar<D> implements DataAccessor<D> {
  // Attributes
  private _data: D | undefined;

  // Methods
  read(): D | undefined {
    return this._data;
  }

  update(data: D) {
    this._data = data;
  }
}