import { DRef } from './d-ref.js';

// Class
export class DVar<D = unknown> extends DRef<D> {
  // Attributes
  private _data: D | undefined;

  // Constructor
  constructor(initial?: D) {
    super({
      read: () => this._data,
      update: (data: D) => {
        this._data = data;
      }
    });

    this._data = initial;
  }
}
