import { Capacitor } from '@capacitor/core'

/**
 * Platform runtime detection.
 * This is the ONLY file in src that imports @capacitor/core for platform detection.
 */

let nativeOverrideForTesting: boolean | null = null

export function setNativeForTesting(val: boolean | null): void {
  nativeOverrideForTesting = val
}

export function isNative(): boolean {
  if (nativeOverrideForTesting !== null) return nativeOverrideForTesting
  return Capacitor.isNativePlatform()
}

export function platformName(): 'android' | 'ios' | 'web' {
  const p = Capacitor.getPlatform()
  if (p === 'android' || p === 'ios') return p
  return 'web'
}

export function isDebugBuild(): boolean {
  // In web dev server or Vite dev build
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    return true
  }
  // If native info indicates debug build
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { __MAGANIS_DEBUG_BUILD__?: boolean })
      .__MAGANIS_DEBUG_BUILD__ === true
  ) {
    return true
  }
  return false
}
