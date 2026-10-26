/**
 * IndexedDB offline storage helper for Maganis.
 * Provides high-capacity key-value storage for custom exercise media,
 * workouts, logs, and backups to prevent localStorage 5MB quota errors.
 */

const DB_NAME = 'maganis_db'
const DB_VERSION = 2
const STORE_NAME = 'maganis_kv'
const MEDIA_STORE_NAME = 'maganis_media'

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
        if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
          db.createObjectStore(MEDIA_STORE_NAME)
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

export async function getMediaItem<T>(key: string): Promise<T | null> {
  const db = await openMaganisDB()
  if (!db) return null

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readonly')
      const store = tx.objectStore(MEDIA_STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () =>
        resolve(req.result !== undefined ? req.result : null)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

export async function setMediaItem<T>(key: string, value: T): Promise<boolean> {
  const db = await openMaganisDB()
  if (!db) return false

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite')
      const store = tx.objectStore(MEDIA_STORE_NAME)
      const req = store.put(value, key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export async function removeMediaItem(key: string): Promise<boolean> {
  const db = await openMaganisDB()
  if (!db) return false

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite')
      const store = tx.objectStore(MEDIA_STORE_NAME)
      const req = store.delete(key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

export async function getAllMediaItems(): Promise<Record<string, string>> {
  const db = await openMaganisDB()
  if (!db) return {}

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readonly')
      const store = tx.objectStore(MEDIA_STORE_NAME)
      const req = store.openCursor()
      const result: Record<string, string> = {}
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          result[String(cursor.key)] = cursor.value
          cursor.continue()
        } else {
          resolve(result)
        }
      }
      req.onerror = () => resolve({})
    } catch {
      resolve({})
    }
  })
}

export async function clearAllMaganisDB(): Promise<void> {
  const db = await openMaganisDB()
  if (!db) return

  const storeNames = Array.from(db.objectStoreNames)
  if (storeNames.length === 0) return

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeNames, 'readwrite')
      for (const name of storeNames) {
        tx.objectStore(name).clear()
      }
      tx.oncomplete = () => {
        db.close()
        resolve()
      }
      tx.onerror = () => {
        db.close()
        resolve()
      }
    } catch {
      db.close()
      resolve()
    }
  })
}
