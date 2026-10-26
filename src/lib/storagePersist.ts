/**
 * src/lib/storagePersist.ts
 * Manages persistent storage requests and status via navigator.storage.
 * Ensures data safety on mobile devices (A3).
 */

export const STORAGE_PERSIST_KEY = 'maganis:storage_persist_requested'

/**
 * Requests persistent storage once per install.
 * Safe to call on each program save or session log.
 */
export async function requestStoragePersistenceOnce(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator?.storage?.persist) {
    return false
  }

  try {
    if (localStorage.getItem(STORAGE_PERSIST_KEY)) {
      return (await navigator.storage?.persisted?.()) ?? false
    }

    const persisted = await navigator.storage.persist()
    localStorage.setItem(STORAGE_PERSIST_KEY, 'true')
    return persisted
  } catch {
    return false
  }
}

/**
 * Checks whether persistent storage has been granted.
 */
export async function isStoragePersisted(): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator?.storage?.persisted) {
    return false
  }

  try {
    return await navigator.storage.persisted()
  } catch {
    return false
  }
}
