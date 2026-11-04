import { registerPlugin } from '@capacitor/core'

export interface NativeAppInfo {
  applicationId: string
  versionName: string
  versionCode: number
  buildType: 'debug' | 'release'
  sdkInt: number
  deviceModel: string
  debuggable: boolean
  signingSha256: string
}

export interface NativeRecoveryEvent {
  key: string
  recoveredFrom: string
  reason: string
  timestamp: number
}

export interface NativeKvReadAllResult {
  data: Record<string, string>
  recoveryEvents: NativeRecoveryEvent[]
}

export interface NativeKvStatsResult {
  keyCount: number
  totalBytes: number
  freeSpaceBytes: number
}

export interface NativeMediaItem {
  mime: string
  dataUrl: string
}

export interface NativeMediaUsageResult {
  count: number
  totalBytes: number
  freeSpaceBytes: number
}

export interface MaganisNativePlugin {
  getInfo(): Promise<NativeAppInfo>
  kvReadAll(): Promise<NativeKvReadAllResult>
  kvWrite(options: {
    key: string
    value: string
  }): Promise<{ success: boolean; key: string }>
  kvWriteChunk(options: {
    key: string
    chunkIndex: number
    totalChunks: number
    chunkData: string
  }): Promise<{
    success: boolean
    key: string
    chunksAssembled?: number
    chunkReceived?: number
    remaining?: number
  }>
  kvRemove(options: { key: string }): Promise<{ success: boolean }>
  kvClear(): Promise<{ success: boolean }>
  kvStats(): Promise<NativeKvStatsResult>
  mediaGet(options: {
    id: string
  }): Promise<{ mime?: string; dataUrl?: string }>
  mediaSet(options: {
    id: string
    mime: string
    dataUrl: string
  }): Promise<{ success: boolean; id: string }>
  mediaRemove(options: { id: string }): Promise<{ success: boolean }>
  mediaGetAll(): Promise<{ items: Record<string, NativeMediaItem> }>
  mediaUsage(): Promise<NativeMediaUsageResult>
}

// In-memory web mock store for tests running without Capacitor
const webMockKv: Record<string, string> = {}
const webMockMedia: Record<string, NativeMediaItem> = {}
const webMockRecoveryEvents: NativeRecoveryEvent[] = []

export const MaganisNative = registerPlugin<MaganisNativePlugin>(
  'MaganisNative',
  {
    web: () => ({
      async getInfo(): Promise<NativeAppInfo> {
        return {
          applicationId: 'app.maganis.coach.web',
          versionName: 'web',
          versionCode: 1,
          buildType: import.meta.env.DEV ? 'debug' : 'release',
          sdkInt: 0,
          deviceModel:
            typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
          debuggable: import.meta.env.DEV,
          signingSha256: 'web-unsigned',
        }
      },
      async kvReadAll(): Promise<NativeKvReadAllResult> {
        const events = [...webMockRecoveryEvents]
        webMockRecoveryEvents.length = 0
        return {
          data: { ...webMockKv },
          recoveryEvents: events,
        }
      },
      async kvWrite(options: {
        key: string
        value: string
      }): Promise<{ success: boolean; key: string }> {
        webMockKv[options.key] = options.value
        return { success: true, key: options.key }
      },
      async kvWriteChunk(options: {
        key: string
        chunkIndex: number
        totalChunks: number
        chunkData: string
      }): Promise<{ success: boolean; key: string; chunksAssembled?: number }> {
        // Simple web chunk accumulator
        if (!webMockKv[options.key + '__chunks']) {
          webMockKv[options.key + '__chunks'] = ''
        }
        webMockKv[options.key + '__chunks'] += options.chunkData
        if (options.chunkIndex === options.totalChunks - 1) {
          webMockKv[options.key] = webMockKv[options.key + '__chunks']
          delete webMockKv[options.key + '__chunks']
          return {
            success: true,
            key: options.key,
            chunksAssembled: options.totalChunks,
          }
        }
        return { success: true, key: options.key }
      },
      async kvRemove(options: { key: string }): Promise<{ success: boolean }> {
        delete webMockKv[options.key]
        return { success: true }
      },
      async kvClear(): Promise<{ success: boolean }> {
        for (const k of Object.keys(webMockKv)) delete webMockKv[k]
        return { success: true }
      },
      async kvStats(): Promise<NativeKvStatsResult> {
        const keys = Object.keys(webMockKv)
        let total = 0
        for (const k of keys) total += webMockKv[k]?.length ?? 0
        return {
          keyCount: keys.length,
          totalBytes: total,
          freeSpaceBytes: 1024 * 1024 * 500, // 500 MB mock
        }
      },
      async mediaGet(options: {
        id: string
      }): Promise<{ mime?: string; dataUrl?: string }> {
        const item = webMockMedia[options.id]
        if (!item) return {}
        return { mime: item.mime, dataUrl: item.dataUrl }
      },
      async mediaSet(options: {
        id: string
        mime: string
        dataUrl: string
      }): Promise<{ success: boolean; id: string }> {
        webMockMedia[options.id] = {
          mime: options.mime,
          dataUrl: options.dataUrl,
        }
        return { success: true, id: options.id }
      },
      async mediaRemove(options: {
        id: string
      }): Promise<{ success: boolean }> {
        delete webMockMedia[options.id]
        return { success: true }
      },
      async mediaGetAll(): Promise<{ items: Record<string, NativeMediaItem> }> {
        return { items: { ...webMockMedia } }
      },
      async mediaUsage(): Promise<NativeMediaUsageResult> {
        const keys = Object.keys(webMockMedia)
        let total = 0
        for (const k of keys) total += webMockMedia[k]?.dataUrl?.length ?? 0
        return {
          count: keys.length,
          totalBytes: total,
          freeSpaceBytes: 1024 * 1024 * 500,
        }
      },
    }),
  },
)
