import { appStorage } from '../platform/storage.ts'

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

export interface Storage {
  get<T>(key: string, fallback: T): T
  set(key: string, value: unknown): void
  remove(key: string): void
  keys(): string[]
}

/**
 * Creates a namespaced JSON wrapper around appStorage.
 * All keys are stored as "<prefix>:<key>" so different apps (and dev vs
 * production environments) never collide on the same origin.
 */
export function createStorage(prefix: string): Storage {
  function fullKey(key: string): string {
    return prefix + ':' + key
  }

  function get<T>(key: string, fallback: T): T {
    const keyWithPrefix = fullKey(key)
    let raw: string | null
    try {
      raw = appStorage.getItem(keyWithPrefix)
    } catch (error) {
      throw new StorageError(
        'Failed to read "' + keyWithPrefix + '" from storage: ' + String(error),
      )
    }
    if (raw === null) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      console.warn(
        '[storage] corrupt JSON for key "' +
          keyWithPrefix +
          '", returning fallback',
      )
      return fallback
    }
  }

  function set(key: string, value: unknown): void {
    const keyWithPrefix = fullKey(key)
    let serialized: string
    try {
      serialized = JSON.stringify(value)
    } catch (error) {
      throw new StorageError(
        'Value for "' +
          keyWithPrefix +
          '" is not JSON-serializable: ' +
          String(error),
      )
    }
    try {
      appStorage.setItem(keyWithPrefix, serialized)
    } catch (error) {
      throw new StorageError(
        'Failed to save "' +
          keyWithPrefix +
          '" to storage (storage full or blocked?). Free up space or unblock site data, then retry. Details: ' +
          String(error),
      )
    }
  }

  function remove(key: string): void {
    appStorage.removeItem(fullKey(key))
  }

  function keys(): string[] {
    const result: string[] = []
    for (let i = 0; i < appStorage.length; i += 1) {
      const storedKey = appStorage.key(i)
      if (storedKey !== null && storedKey.startsWith(prefix + ':')) {
        result.push(storedKey.slice(prefix.length + 1))
      }
    }
    return result
  }

  return { get, set, remove, keys }
}
