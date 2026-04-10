export interface IdbKvEntry<T> {
  value: T;
  expiresAtMs: number | null;
}

const DB_NAME = "odc-dashboard-kv";
const DB_VERSION = 1;
const STORE_NAME = "kv";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const request = run(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function idbKvGet<T>(key: string): Promise<IdbKvEntry<T> | null> {
  if (!isBrowser()) return null;
  const entry = await withStore<IdbKvEntry<T> | undefined>("readonly", (store) =>
    store.get(key)
  );
  if (!entry) return null;
  if (entry.expiresAtMs != null && Date.now() > entry.expiresAtMs) {
    await idbKvDelete(key);
    return null;
  }
  return entry;
}

export async function idbKvSet<T>(
  key: string,
  value: T,
  options?: { ttlMs?: number }
): Promise<void> {
  if (!isBrowser()) return;
  const ttlMs = options?.ttlMs;
  const entry: IdbKvEntry<T> = {
    value,
    expiresAtMs: typeof ttlMs === "number" ? Date.now() + ttlMs : null,
  };
  await withStore<IDBValidKey>("readwrite", (store) => store.put(entry, key));
}

export async function idbKvDelete(key: string): Promise<void> {
  if (!isBrowser()) return;
  await withStore<undefined>("readwrite", (store) => store.delete(key));
}

