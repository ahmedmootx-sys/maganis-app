/**
 * IndexedDB offline storage helper for Maganis.
 * Provides high-capacity key-value storage for custom exercise media,
 * workouts, logs, and backups to prevent localStorage 5MB quota errors.
 *
 * In Native mode (Capacitor), delegates to native durable storage and
 * native media files behind the platform facade.
 */

import { isNative } from '../platform/runtime.ts'
import { appStorage } from '../platform/storage.ts'
import { MaganisNative } from '../platform/native/maganisNative.ts'

const DB_NAME = 'maganis_db'
const DB_VERSION = 2
const STORE_NAME = 'maganis_kv'
const MEDIA_STORE_NAME = 'maganis_media'

// In-memory fallback for environments without IndexedDB (e.g. jsdom unit tests)
const memoryKV: Record<string, unknown> = {}
const memoryMedia: Record<string, unknown> = {}

export function hasIndexedDB(): boolean {
  return typeof window !== 'undefined' && Boolean(window.indexedDB)
}

export async function openMaganisDB(): Promise<IDBDatabase | null> {
  if (!hasIndexedDB()) {
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
  if (isNative()) {
    const raw = appStorage.getItem(`idb/${key}`)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  if (!hasIndexedDB()) {
    const val = memoryKV[key]
    return val !== undefined ? (val as T) : null
  }
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
  if (isNative()) {
    try {
      appStorage.setItem(`idb/${key}`, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  if (!hasIndexedDB()) {
    memoryKV[key] = value
    return true
  }
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
  if (isNative()) {
    try {
      appStorage.removeItem(`idb/${key}`)
      return true
    } catch {
      return false
    }
  }

  if (!hasIndexedDB()) {
    delete memoryKV[key]
    return true
  }
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
  if (isNative()) {
    try {
      const res = await MaganisNative.mediaGet({ id: key })
      if (!res.dataUrl) return null
      return res as unknown as T
    } catch {
      return null
    }
  }

  if (!hasIndexedDB()) {
    const val = memoryMedia[key]
    return val !== undefined ? (val as T) : null
  }
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
  if (isNative()) {
    try {
      const v = value as { mime?: string; dataUrl?: string }
      const res = await MaganisNative.mediaSet({
        id: key,
        mime: v?.mime || 'image/jpeg',
        dataUrl: v?.dataUrl || String(value),
      })
      return res.success
    } catch {
      return false
    }
  }

  if (!hasIndexedDB()) {
    memoryMedia[key] = value
    return true
  }
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
  if (isNative()) {
    try {
      const res = await MaganisNative.mediaRemove({ id: key })
      return res.success
    } catch {
      return false
    }
  }

  if (!hasIndexedDB()) {
    delete memoryMedia[key]
    return true
  }
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

export async function getAllMediaItems(): Promise<Record<string, unknown>> {
  if (isNative()) {
    try {
      const res = await MaganisNative.mediaGetAll()
      return res.items ?? {}
    } catch {
      return {}
    }
  }

  if (!hasIndexedDB()) {
    return { ...(memoryMedia as Record<string, unknown>) }
  }
  const db = await openMaganisDB()
  if (!db) return {}

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readonly')
      const store = tx.objectStore(MEDIA_STORE_NAME)
      const req = store.openCursor()
      const result: Record<string, unknown> = {}
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
  for (const k of Object.keys(memoryKV)) delete memoryKV[k]
  for (const k of Object.keys(memoryMedia)) delete memoryMedia[k]

  if (isNative()) {
    // Remove all idb/ keys from appStorage and clear media
    const all = appStorage.getAll()
    for (const k of Object.keys(all)) {
      if (k.startsWith('idb/')) {
        appStorage.removeItem(k)
      }
    }
    try {
      const allMedia = await MaganisNative.mediaGetAll()
      for (const id of Object.keys(allMedia.items || {})) {
        await MaganisNative.mediaRemove({ id })
      }
    } catch {
      // ignore
    }
    return
  }

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
