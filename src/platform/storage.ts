import { isNative } from './runtime.ts'
import { durableKv } from './native/durableKv.ts'
import { storageHealth } from './storageHealth.ts'

export interface StorageChangeEvent {
  key: string | null
  newValue: string | null
  oldValue: string | null
}

export type StorageChangeListener = (event: StorageChangeEvent) => void

export interface AppStorageInterface extends Storage {
  subscribe(listener: StorageChangeListener): () => void
  hydrate(entries: Record<string, string>): void
  getAll(): Record<string, string>
  flush(): Promise<void>
  isHydrated(): boolean
}

class AppStorageImpl implements AppStorageInterface {
  private inMemoryMap = new Map<string, string>()
  private listeners = new Set<StorageChangeListener>()
  private _isHydrated = false

  constructor() {
    // If running on web, wire up cross-tab window 'storage' listener
    if (typeof window !== 'undefined' && !isNative()) {
      window.addEventListener('storage', (event: StorageEvent) => {
        this.notifyListeners({
          key: event.key,
          newValue: event.newValue,
          oldValue: event.oldValue,
        })
      })
    }
  }

  isHydrated(): boolean {
    if (!isNative()) return true
    return this._isHydrated
  }

  hydrate(entries: Record<string, string>): void {
    this.inMemoryMap.clear()
    for (const [k, v] of Object.entries(entries)) {
      this.inMemoryMap.set(k, v)
    }
    this._isHydrated = true
  }

  getAll(): Record<string, string> {
    if (!isNative()) {
      const result: Record<string, string> = {}
      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k !== null) {
            result[k] = localStorage.getItem(k) ?? ''
          }
        }
      }
      return result
    }
    const result: Record<string, string> = {}
    for (const [k, v] of this.inMemoryMap.entries()) {
      result[k] = v
    }
    return result
  }

  async flush(): Promise<void> {
    if (isNative()) {
      await durableKv.flush()
    }
  }

  subscribe(listener: StorageChangeListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(event: StorageChangeEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch (err) {
        console.error('Error in storage change listener:', err)
      }
    }
  }

  get length(): number {
    if (!isNative()) {
      return typeof localStorage !== 'undefined' ? localStorage.length : 0
    }
    return this.inMemoryMap.size
  }

  key(index: number): string | null {
    if (!isNative()) {
      return typeof localStorage !== 'undefined'
        ? localStorage.key(index)
        : null
    }
    const keys = Array.from(this.inMemoryMap.keys())
    return keys[index] ?? null
  }

  getItem(key: string): string | null {
    if (!isNative()) {
      if (typeof localStorage === 'undefined') return null
      try {
        return localStorage.getItem(key)
      } catch (err) {
        storageHealth.recordError(key, err)
        throw err
      }
    }
    return this.inMemoryMap.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (storageHealth.getStatus() === 'readonly') {
      console.warn(
        `[storage] Refusing write to "${key}" while in read-only recovery mode.`,
      )
      return
    }

    const oldValue = this.getItem(key)

    if (!isNative()) {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(key, value)
          storageHealth.recordWriteSuccess()
        } catch (err) {
          storageHealth.recordError(key, err)
          throw err
        }
      }
    } else {
      this.inMemoryMap.set(key, value)
      durableKv
        .queueWrite(key, value)
        .then(() => {
          storageHealth.recordWriteSuccess()
        })
        .catch((err) => {
          storageHealth.recordError(key, err)
        })
    }

    this.notifyListeners({ key, newValue: value, oldValue })
  }

  removeItem(key: string): void {
    if (storageHealth.getStatus() === 'readonly') {
      console.warn(
        `[storage] Refusing remove of "${key}" while in read-only recovery mode.`,
      )
      return
    }

    const oldValue = this.getItem(key)

    if (!isNative()) {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(key)
        } catch (err) {
          storageHealth.recordError(key, err)
        }
      }
    } else {
      this.inMemoryMap.delete(key)
      durableKv.queueRemove(key).catch((err) => {
        storageHealth.recordError(key, err)
      })
    }

    this.notifyListeners({ key, newValue: null, oldValue })
  }

  clear(): void {
    if (storageHealth.getStatus() === 'readonly') {
      console.warn('[storage] Refusing clear while in read-only recovery mode.')
      return
    }

    if (!isNative()) {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.clear()
        } catch (err) {
          storageHealth.recordError('*', err)
        }
      }
    } else {
      this.inMemoryMap.clear()
      durableKv.queueClear().catch((err) => {
        storageHealth.recordError('*', err)
      })
    }

    this.notifyListeners({ key: null, newValue: null, oldValue: null })
  }
}

export const appStorage: AppStorageInterface = new AppStorageImpl()
