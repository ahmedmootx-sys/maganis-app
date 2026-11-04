import { App } from '@capacitor/app'
import { isNative, platformName } from './runtime.ts'
import { MaganisNative } from './native/maganisNative.ts'
import { backButtonManager, type BackHandler } from './backStack.ts'
import { appStorage } from './storage.ts'
import {
  setMediaItem,
  getMediaItem,
  removeMediaItem,
} from '../lib/indexedStorage.ts'
import { haptics } from './haptics.ts'
import { setKeepScreenOn, isKeepAwakeSupported } from './keepAwake.ts'
import {
  syncSchedule,
  cancelAllNotifications,
} from './notifications/notificationEngine.ts'

export interface PlatformInfo {
  applicationId: string
  versionName: string
  versionCode: number
  buildType: 'debug' | 'release'
  sdkInt: number
  deviceModel: string
  debuggable: boolean
  signingSha256: string
  isNative: boolean
  platform: 'android' | 'ios' | 'web'
}

export interface PlatformApp {
  onPause(cb: () => void): () => void
  onResume(cb: () => void): () => void
  exit(): void
  registerBackHandler(handler: BackHandler, priority?: number): () => void
}

export interface PlatformKV {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

export interface PlatformMedia {
  saveMedia(id: string, data: Blob | ArrayBuffer): Promise<string>
  getMedia(id: string): Promise<Blob | null>
  deleteMedia(id: string): Promise<void>
}

export interface PlatformFiles {
  saveFile(
    filename: string,
    data: Blob | string,
  ): Promise<{ success: boolean; error?: string }>
  readFile(filename: string): Promise<{ data?: Blob | string; error?: string }>
}

export interface PlatformNotifications {
  schedule(): Promise<{ supported: boolean; error?: string }>
  cancelAll(): Promise<{ supported: boolean; error?: string }>
}

export interface PlatformHaptics {
  vibrate(duration?: number): Promise<{ supported: boolean }>
  impactLight(): Promise<void>
  notifySuccess(): Promise<void>
  notifyWarning(): Promise<void>
}

export interface PlatformKeepAwake {
  keepAwake(): Promise<{ supported: boolean }>
  allowSleep(): Promise<{ supported: boolean }>
}

export interface Platform {
  info: {
    getInfo(): Promise<PlatformInfo>
  }
  app: PlatformApp
  kv: PlatformKV
  media: PlatformMedia
  files: PlatformFiles
  notifications: PlatformNotifications
  haptics: PlatformHaptics
  keepAwake: PlatformKeepAwake
}

/**
 * Default live platform implementation.
 */
function createLivePlatform(): Platform {
  return {
    info: {
      async getInfo(): Promise<PlatformInfo> {
        const native = isNative()
        if (native) {
          try {
            const raw = await MaganisNative.getInfo()
            return {
              applicationId: raw.applicationId,
              versionName: raw.versionName,
              versionCode: raw.versionCode,
              buildType: raw.buildType,
              sdkInt: raw.sdkInt,
              deviceModel: raw.deviceModel,
              debuggable: raw.debuggable,
              signingSha256: raw.signingSha256,
              isNative: true,
              platform: platformName(),
            }
          } catch (err) {
            console.warn('Failed to call MaganisNative.getInfo():', err)
          }
        }

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
          isNative: false,
          platform: 'web',
        }
      },
    },

    app: {
      onPause(cb: () => void): () => void {
        if (!isNative()) return () => {}
        const handle = App.addListener('appStateChange', (state) => {
          if (!state.isActive) cb()
        })
        return () => {
          void handle.then((h) => h.remove())
        }
      },
      onResume(cb: () => void): () => void {
        if (!isNative()) return () => {}
        const handle = App.addListener('appStateChange', (state) => {
          if (state.isActive) cb()
        })
        return () => {
          void handle.then((h) => h.remove())
        }
      },
      exit(): void {
        if (isNative()) {
          void App.exitApp()
        }
      },
      registerBackHandler(handler: BackHandler, priority = 10): () => void {
        return backButtonManager.register(handler, priority)
      },
    },

    // Task N2: Durable KV and Media Storage
    kv: {
      async get(key: string): Promise<string | null> {
        return appStorage.getItem(key)
      },
      async set(key: string, value: string): Promise<void> {
        appStorage.setItem(key, value)
        await appStorage.flush()
      },
      async remove(key: string): Promise<void> {
        appStorage.removeItem(key)
        await appStorage.flush()
      },
      async clear(): Promise<void> {
        appStorage.clear()
        await appStorage.flush()
      },
    },

    media: {
      async saveMedia(id: string, data: Blob | ArrayBuffer): Promise<string> {
        let dataUrl: string
        if (data instanceof Blob) {
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(data)
          })
        } else {
          const blob = new Blob([data])
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        }
        await setMediaItem(id, { mime: 'image/jpeg', dataUrl })
        return id
      },
      async getMedia(id: string): Promise<Blob | null> {
        const item = await getMediaItem<{ mime?: string; dataUrl?: string }>(id)
        if (!item || !item.dataUrl) return null
        const res = await fetch(item.dataUrl)
        return res.blob()
      },
      async deleteMedia(id: string): Promise<void> {
        await removeMediaItem(id)
      },
    },

    // Task N3: Native Backup and Durable Files
    files: {
      async saveFile(
        filename: string,
        data: Blob | string,
      ): Promise<{ success: boolean; error?: string }> {
        if (!isNative()) {
          return {
            success: false,
            error: 'Web uses universal saveFile directly',
          }
        }
        try {
          const res = await MaganisNative.saveAs({
            name: filename,
            mime:
              typeof data === 'string'
                ? 'application/json'
                : data.type || 'application/octet-stream',
          })
          return { success: res.success }
        } catch (err) {
          return { success: false, error: String(err) }
        }
      },
      async readFile(
        filename: string,
      ): Promise<{ data?: Blob | string; error?: string }> {
        try {
          const res = await MaganisNative.openRead({ name: filename })
          let content = ''
          let eof = false
          while (!eof) {
            const chunk = await MaganisNative.readChunk({ handle: res.handle })
            if (chunk.chunkBase64) {
              try {
                content += atob(chunk.chunkBase64)
              } catch {
                content += chunk.chunkBase64
              }
            }
            eof = chunk.eof
          }
          await MaganisNative.closeRead({ handle: res.handle })
          return { data: content }
        } catch (err) {
          return { error: String(err) }
        }
      },
    },

    notifications: {
      async schedule(): Promise<{ supported: boolean; error?: string }> {
        try {
          await syncSchedule()
          return { supported: true }
        } catch (err) {
          return { supported: false, error: String(err) }
        }
      },
      async cancelAll(): Promise<{ supported: boolean; error?: string }> {
        try {
          await cancelAllNotifications()
          return { supported: true }
        } catch (err) {
          return { supported: false, error: String(err) }
        }
      },
    },

    haptics: {
      async vibrate(duration?: number): Promise<{ supported: boolean }> {
        await haptics.vibrate(duration)
        return { supported: true }
      },
      async impactLight(): Promise<void> {
        await haptics.impactLight()
      },
      async notifySuccess(): Promise<void> {
        await haptics.notifySuccess()
      },
      async notifyWarning(): Promise<void> {
        await haptics.notifyWarning()
      },
    },

    keepAwake: {
      async keepAwake(): Promise<{ supported: boolean }> {
        if (!isKeepAwakeSupported()) {
          return { supported: false }
        }
        const ok = await setKeepScreenOn(true)
        return { supported: ok }
      },
      async allowSleep(): Promise<{ supported: boolean }> {
        if (!isKeepAwakeSupported()) {
          return { supported: false }
        }
        await setKeepScreenOn(false)
        return { supported: true }
      },
    },
  }
}

let activePlatform: Platform = createLivePlatform()

/**
 * Access the active platform provider.
 */
export const platform: Platform = {
  get info() {
    return activePlatform.info
  },
  get app() {
    return activePlatform.app
  },
  get kv() {
    return activePlatform.kv
  },
  get media() {
    return activePlatform.media
  },
  get files() {
    return activePlatform.files
  },
  get notifications() {
    return activePlatform.notifications
  },
  get haptics() {
    return activePlatform.haptics
  },
  get keepAwake() {
    return activePlatform.keepAwake
  },
}

/**
 * Testing helper: inject a custom/mock platform instance.
 */
export function setPlatformForTesting(customPlatform: Platform | null) {
  activePlatform = customPlatform ?? createLivePlatform()
}
