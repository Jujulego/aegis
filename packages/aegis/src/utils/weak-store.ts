import { KeyPart } from '@jujulego/event-tree';

// Class
export class WeakStore<T extends object> {
  // Attributes
  private readonly _entities = new Map<KeyPart, WeakRef<T>>;

  // Methods
  get(key: KeyPart): T | undefined {
    return this._entities.get(key)?.deref();
  }

  set(key: KeyPart, entity: T) {
    this._entities.set(key, new WeakRef(entity));
  }

  getOrCreate(key: KeyPart, builder: () => T): T {
    let entity = this.get(key);

    if (!entity) {
      entity = builder();
      this.set(key, entity);
    }

    return entity;
  }
}
