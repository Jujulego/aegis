import { AegisEntity, AegisItem, EntityIdExtractor } from './entities';
import { AegisMemoryStore, AegisStorageStore, AegisStore } from './stores';
import { AegisQuery } from './protocols';

// Constants
const AEGIS_STORES_KEY = Symbol('jujulego:aegis-core:stores');

// Type
export type Aegis<T, M> = M & {
  $entity: AegisEntity<T>;
  $get<N extends string>(name: N, sender: (id: string) => AegisQuery<T>): Aegis<T, M & Record<N, (id: string) => AegisItem<T>>>;
}

declare global {
  interface Window {
    [AEGIS_STORES_KEY]?: {
      memory?: AegisMemoryStore;
      localStorage?: AegisStorageStore;
      sessionStorage?: AegisStorageStore;
    };
  }
}

// Store builder
function globalStores() {
  return self[AEGIS_STORES_KEY] ??= {};
}

export const $store = {
  /**
   * Returns global memory store
   */
  get memory() {
    return globalStores().memory ??= new AegisMemoryStore();
  },

  /**
   * Returns global storage store using localStorage
   */
  get localStorage() {
    return globalStores().localStorage ??= new AegisStorageStore(localStorage);
  },

  /**
   * Returns global storage store using sessionStorage
   */
  get sessionStorage() {
    return globalStores().sessionStorage ??= new AegisStorageStore(sessionStorage);
  }
};

// Entity builder
export function $entity<T>(name: string, store: AegisStore, extractor: EntityIdExtractor<T>): Aegis<T, unknown> {
  return {
    $entity: new AegisEntity<T>(name, store, extractor),
    $get<N extends string>(name: N, sender: (id: string) => AegisQuery<T>): Aegis<T, Record<N, (id: string) => AegisItem<T>>> {
      return Object.assign(this, {
        [name]: (id: string) => this.$entity.queryItem(id, sender),
      });
    }
  };
}
