import { App } from '@capacitor/app'
import { isNative, platformName } from './runtime.ts'
import { MaganisNative } from './native/maganisNative.ts'
import { backButtonManager, type BackHandler } from './backStack.ts'

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
  schedule(options: unknown): Promise<{ supported: boolean; error?: string }>
  cancel(id: string): Promise<{ supported: boolean; error?: string }>
}

export interface PlatformHaptics {
  vibrate(): Promise<{ supported: boolean }>
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

    // Task N2 stand-in: typed honest "unsupported"
    kv: {
      async get(): Promise<string | null> {
        throw new Error(
          'unsupported: Task N2 native durable storage not implemented yet',
        )
      },
      async set(): Promise<void> {
        throw new Error(
          'unsupported: Task N2 native durable storage not implemented yet',
        )
      },
      async remove(): Promise<void> {
        throw new Error(
          'unsupported: Task N2 native durable storage not implemented yet',
        )
      },
      async clear(): Promise<void> {
        throw new Error(
          'unsupported: Task N2 native durable storage not implemented yet',
        )
      },
    },

    // Task N2 stand-in: typed honest "unsupported"
    media: {
      async saveMedia(): Promise<string> {
        throw new Error(
          'unsupported: Task N2 native media storage not implemented yet',
        )
      },
      async getMedia(): Promise<Blob | null> {
        throw new Error(
          'unsupported: Task N2 native media storage not implemented yet',
        )
      },
      async deleteMedia(): Promise<void> {
        throw new Error(
          'unsupported: Task N2 native media storage not implemented yet',
        )
      },
    },

    // Task N3 stand-in: typed honest "unsupported"
    files: {
      async saveFile(): Promise<{ success: boolean; error: string }> {
        return {
          success: false,
          error: 'unsupported: Task N3 backup files not implemented yet',
        }
      },
      async readFile(): Promise<{ error: string }> {
        return {
          error: 'unsupported: Task N3 backup files not implemented yet',
        }
      },
    },

    // Task N4 stand-in: typed honest "unsupported"
    notifications: {
      async schedule(): Promise<{ supported: boolean; error: string }> {
        return {
          supported: false,
          error: 'unsupported: Task N4 notifications not implemented yet',
        }
      },
      async cancel(): Promise<{ supported: boolean; error: string }> {
        return {
          supported: false,
          error: 'unsupported: Task N4 notifications not implemented yet',
        }
      },
    },

    // Task N4 stand-in: typed honest "unsupported"
    haptics: {
      async vibrate(): Promise<{ supported: boolean }> {
        return { supported: false }
      },
    },

    // Task N4 stand-in: typed honest "unsupported"
    keepAwake: {
      async keepAwake(): Promise<{ supported: boolean }> {
        return { supported: false }
      },
      async allowSleep(): Promise<{ supported: boolean }> {
        return { supported: false }
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
