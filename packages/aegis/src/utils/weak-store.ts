// Class
export class WeakStore<T extends object> {
  // Attributes
  private readonly _entities = new Map<string, WeakRef<T>>;

  // Methods
  get(key: string): T | undefined {
    return this._entities.get(key)?.deref();
  }

  set(key: string, entity: T) {
    this._entities.set(key, new WeakRef(entity));
  }

  getOrCreate(key: string, builder: () => T): T {
    let entity = this.get(key);

    if (!entity) {
      entity = builder();
      this.set(key, entity);
    }

    return entity;
  }
}