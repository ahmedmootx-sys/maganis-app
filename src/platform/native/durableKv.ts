import { MaganisNative, type MaganisNativePlugin } from './maganisNative.ts'
import {
  setStorageHealthDegraded,
  recordStorageError,
} from '../storageHealth.ts'

export interface DurableKvOptions {
  dispatchDelayMs?: number
  chunkThresholdBytes?: number
  chunkSizeBytes?: number
  nativePlugin?: Pick<
    MaganisNativePlugin,
    'kvWrite' | 'kvWriteChunk' | 'kvRemove' | 'kvClear'
  >
}

interface QueuedOp {
  type: 'write' | 'remove' | 'clear'
  key: string
  value?: string
  resolve: () => void
  reject: (err: unknown) => void
  queuedAt: number
}

const DEFAULT_DISPATCH_DELAY_MS = 50
const DEFAULT_CHUNK_THRESHOLD_BYTES = 1024 * 1024 // 1 MB
const DEFAULT_CHUNK_SIZE_BYTES = 512 * 1024 // 512 KB

export class DurableKvManager {
  private pendingOpsByKey = new Map<string, QueuedOp>()
  private isProcessing = false
  private dispatchTimer: ReturnType<typeof setTimeout> | null = null
  private acknowledgedWrites = 0
  private options: Required<Omit<DurableKvOptions, 'nativePlugin'>>
  private nativePlugin: Pick<
    MaganisNativePlugin,
    'kvWrite' | 'kvWriteChunk' | 'kvRemove' | 'kvClear'
  >

  constructor(options?: DurableKvOptions) {
    this.options = {
      dispatchDelayMs: options?.dispatchDelayMs ?? DEFAULT_DISPATCH_DELAY_MS,
      chunkThresholdBytes:
        options?.chunkThresholdBytes ?? DEFAULT_CHUNK_THRESHOLD_BYTES,
      chunkSizeBytes: options?.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE_BYTES,
    }
    this.nativePlugin = options?.nativePlugin ?? MaganisNative
  }

  getAcknowledgedWrites(): number {
    return this.acknowledgedWrites
  }

  queueWrite(key: string, value: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Latest-value-wins coalescing
      const existing = this.pendingOpsByKey.get(key)
      if (existing) {
        existing.resolve() // Superseded
      }
      this.pendingOpsByKey.set(key, {
        type: 'write',
        key,
        value,
        resolve,
        reject,
        queuedAt: Date.now(),
      })
      this.scheduleDispatch()
    })
  }

  queueRemove(key: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const existing = this.pendingOpsByKey.get(key)
      if (existing) {
        existing.resolve()
      }
      this.pendingOpsByKey.set(key, {
        type: 'remove',
        key,
        resolve,
        reject,
        queuedAt: Date.now(),
      })
      this.scheduleDispatch()
    })
  }

  queueClear(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Clear supersedes all pending writes
      for (const op of this.pendingOpsByKey.values()) {
        op.resolve()
      }
      this.pendingOpsByKey.clear()
      this.pendingOpsByKey.set('__ALL__', {
        type: 'clear',
        key: '__ALL__',
        resolve,
        reject,
        queuedAt: Date.now(),
      })
      this.scheduleDispatch()
    })
  }

  private scheduleDispatch(): void {
    if (this.dispatchTimer !== null) return
    this.dispatchTimer = setTimeout(() => {
      this.dispatchTimer = null
      void this.processQueue()
    }, this.options.dispatchDelayMs)
  }

  async flush(): Promise<void> {
    if (this.dispatchTimer !== null) {
      clearTimeout(this.dispatchTimer)
      this.dispatchTimer = null
    }
    await this.processQueue()
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return
    if (this.pendingOpsByKey.size === 0) return

    this.isProcessing = true
    try {
      while (this.pendingOpsByKey.size > 0) {
        // Take current snapshot of queue
        const opsToProcess = Array.from(this.pendingOpsByKey.values())
        this.pendingOpsByKey.clear()

        for (const op of opsToProcess) {
          try {
            if (op.type === 'write' && op.value !== undefined) {
              await this.executeWrite(op.key, op.value)
            } else if (op.type === 'remove') {
              await this.nativePlugin.kvRemove({ key: op.key })
            } else if (op.type === 'clear') {
              await this.nativePlugin.kvClear()
            }
            this.acknowledgedWrites += 1
            op.resolve()
          } catch (err) {
            recordStorageError(op.key, err)
            setStorageHealthDegraded(`فشل حفظ المفتاح ${op.key}`)
            op.reject(err)
          }
        }
      }
    } finally {
      this.isProcessing = false
      if (this.pendingOpsByKey.size > 0) {
        this.scheduleDispatch()
      }
    }
  }

  private async executeWrite(key: string, value: string): Promise<void> {
    const valLength = value.length
    if (valLength <= this.options.chunkThresholdBytes) {
      // Normal single write
      await this.nativePlugin.kvWrite({ key, value })
    } else {
      // Chunked write for large values > 1 MB
      const chunkSize = this.options.chunkSizeBytes
      const totalChunks = Math.ceil(valLength / chunkSize)
      for (let i = 0; i < totalChunks; i++) {
        const chunkData = value.slice(i * chunkSize, (i + 1) * chunkSize)
        await this.nativePlugin.kvWriteChunk({
          key,
          chunkIndex: i,
          totalChunks,
          chunkData,
        })
      }
    }
  }
}

export const durableKv = new DurableKvManager()
