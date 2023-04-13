// Class
export class WeakStore<K, T extends object> {
  // Attributes
  private readonly _entities = new Map<K, WeakRef<T>>;

  // Methods
  get(key: K): T | undefined {
    return this._entities.get(key)?.deref();
  }

  set(key: K, entity: T) {
    this._entities.set(key, new WeakRef(entity));
  }

  delete(key: K) {
    this._entities.delete(key);
  }

  getOrCreate(key: K, builder: () => T): T {
    let entity = this.get(key);

    if (!entity) {
      entity = builder();
      this.set(key, entity);
    }

    return entity;
  }
}
