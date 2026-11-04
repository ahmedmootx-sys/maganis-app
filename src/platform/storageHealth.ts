import { useSyncExternalStore } from 'react'

export type HealthStatus = 'ok' | 'degraded' | 'readonly' | 'corrupt'

export interface StorageErrorRecord {
  key: string
  error: string
  timestamp: number
}

export interface StorageDiagnostics {
  status: HealthStatus
  reason?: string
  corruptKeys: string[]
  recentErrors: StorageErrorRecord[]
  lastSuccessfulWriteAt: number | null
  freeSpaceBytes: number | null
  totalBytes: number | null
  keyCount: number | null
}

const LOW_SPACE_THRESHOLD_BYTES = 50 * 1024 * 1024 // 50 MB

class StorageHealthManager {
  private status: HealthStatus = 'ok'
  private reason?: string
  private corruptKeys: Set<string> = new Set()
  private recentErrors: StorageErrorRecord[] = []
  private lastSuccessfulWriteAt: number | null = null
  private freeSpaceBytes: number | null = null
  private totalBytes: number | null = null
  private keyCount: number | null = null
  private listeners: Set<() => void> = new Set()
  private cachedSnapshot: StorageDiagnostics | null = null

  getStatus(): HealthStatus {
    return this.status
  }

  getSnapshot(): StorageDiagnostics {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = {
        status: this.status,
        reason: this.reason,
        corruptKeys: Array.from(this.corruptKeys),
        recentErrors: [...this.recentErrors],
        lastSuccessfulWriteAt: this.lastSuccessfulWriteAt,
        freeSpaceBytes: this.freeSpaceBytes,
        totalBytes: this.totalBytes,
        keyCount: this.keyCount,
      }
    }
    return this.cachedSnapshot
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    this.cachedSnapshot = null
    for (const listener of this.listeners) {
      listener()
    }
  }

  setOk(): void {
    if (this.status === 'readonly') return // Cannot leave readonly automatically
    this.status = 'ok'
    this.reason = undefined
    this.notify()
  }

  resetForTest(): void {
    this.status = 'ok'
    this.reason = undefined
    this.corruptKeys.clear()
    this.recentErrors = []
    this.lastSuccessfulWriteAt = null
    this.notify()
  }

  setDegraded(reason: string): void {
    if (this.status === 'readonly') return
    this.status = 'degraded'
    this.reason = reason
    this.notify()
  }

  setReadonlyRecovery(reason: string, corruptKeys?: string[]): void {
    this.status = 'readonly'
    this.reason = reason
    if (corruptKeys) {
      for (const k of corruptKeys) this.corruptKeys.add(k)
    }
    this.notify()
  }

  setCorrupt(key: string, reason: string): void {
    this.corruptKeys.add(key)
    if (this.status !== 'readonly') {
      this.status = 'corrupt'
      this.reason = reason
    }
    this.notify()
  }

  recordWriteSuccess(): void {
    this.lastSuccessfulWriteAt = Date.now()
    if (this.status === 'degraded' && this.recentErrors.length === 0) {
      this.setOk()
    } else {
      this.notify()
    }
  }

  recordError(key: string, err: unknown): void {
    const errorStr = String(err)
    this.recentErrors.unshift({
      key,
      error: errorStr,
      timestamp: Date.now(),
    })
    if (this.recentErrors.length > 20) {
      this.recentErrors.pop()
    }
    this.setDegraded(`فشل حفظ البيانات للمفتاح ${key}`)
  }

  updateDiskStats(
    freeBytes: number,
    totalBytes?: number,
    keyCount?: number,
  ): void {
    this.freeSpaceBytes = freeBytes
    if (totalBytes !== undefined) this.totalBytes = totalBytes
    if (keyCount !== undefined) this.keyCount = keyCount

    if (freeBytes < LOW_SPACE_THRESHOLD_BYTES) {
      this.setDegraded('المساحة المتبقية على جهازك أقل من 50 ميجابايت')
    }
    this.notify()
  }

  isLowSpace(): boolean {
    return (
      this.freeSpaceBytes !== null &&
      this.freeSpaceBytes < LOW_SPACE_THRESHOLD_BYTES
    )
  }
}

export const storageHealth = new StorageHealthManager()

export function setStorageHealthDegraded(reason: string): void {
  storageHealth.setDegraded(reason)
}

export function setStorageHealthReadonly(
  reason: string,
  corruptKeys?: string[],
): void {
  storageHealth.setReadonlyRecovery(reason, corruptKeys)
}

export function recordStorageError(key: string, err: unknown): void {
  storageHealth.recordError(key, err)
}

export function useStorageHealth(): StorageDiagnostics {
  return useSyncExternalStore(
    (onStoreChange) => storageHealth.subscribe(onStoreChange),
    () => storageHealth.getSnapshot(),
    () => storageHealth.getSnapshot(),
  )
}
