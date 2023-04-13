import { DRef } from './d-ref';

// Class
export class DVar<D> extends DRef<D> {
  // Attributes
  private _data: D | undefined;

  // Constructor
  constructor() {
    super({
      read: () => this._data,
      update(data: D) {
        this._data = data;
      }
    });
  }
}