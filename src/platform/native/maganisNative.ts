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

export interface MaganisNativePlugin {
  getInfo(): Promise<NativeAppInfo>
}

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
    }),
  },
)
