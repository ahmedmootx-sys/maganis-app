/**
 * src/lib/storagePersist.ts
 * Manages persistent storage requests and status via navigator.storage.
 * Ensures data safety on mobile devices (A3).
 */

import { isNative } from '../platform/runtime.ts'
import { appStorage } from '../platform/storage.ts'

export const STORAGE_PERSIST_KEY = 'maganis:storage_persist_requested'

/**
 * Requests persistent storage once per install.
 * Safe to call on each program save or session log.
 * In native Capacitor builds, app storage is already permanent and this is a no-op.
 */
export async function requestStoragePersistenceOnce(): Promise<boolean> {
  if (isNative()) {
    return true
  }

  if (typeof window === 'undefined' || !navigator?.storage?.persist) {
    return false
  }

  try {
    if (appStorage.getItem(STORAGE_PERSIST_KEY)) {
      return (await navigator.storage?.persisted?.()) ?? false
    }

    const persisted = await navigator.storage.persist()
    appStorage.setItem(STORAGE_PERSIST_KEY, 'true')
    return persisted
  } catch {
    return false
  }
}

/**
 * Checks whether persistent storage has been granted.
 * In native Capacitor builds, returns true immediately.
 */
export async function isStoragePersisted(): Promise<boolean> {
  if (isNative()) {
    return true
  }

  if (typeof window === 'undefined' || !navigator?.storage?.persisted) {
    return false
  }

  try {
    return await navigator.storage.persisted()
  } catch {
    return false
  }
}
