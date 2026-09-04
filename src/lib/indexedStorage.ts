/**
 * IndexedDB offline storage helper for Maganis.
 * Provides high-capacity key-value storage for custom exercise media,
 * workouts, logs, and backups to prevent localStorage 5MB quota errors.
 */

const DB_NAME = 'maganis_db'
const DB_VERSION = 1
const STORE_NAME = 'maganis_kv'

export async function openMaganisDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function getIndexedItem<T>(key: string): Promise<T | null> {
  const db = await openMaganisDB()
  if (!db) return null

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () =>
        resolve(req.result !== undefined ? req.result : null)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function setIndexedItem<T>(
  key: string,
  value: T,
): Promise<boolean> {
  const db = await openMaganisDB()
  if (!db) return false

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(value, key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export async function removeIndexedItem(key: string): Promise<boolean> {
  const db = await openMaganisDB()
  if (!db) return false

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}
