import { useEffect, useRef, useState } from 'react'
import { isNative } from './runtime.ts'
import { MaganisNative } from './native/maganisNative.ts'
import { getNotificationSettings } from './notifications/notificationStore.ts'

export function isKeepAwakeSupported(): boolean {
  if (isNative()) return true
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

export async function setKeepScreenOn(enabled: boolean): Promise<boolean> {
  if (isNative()) {
    try {
      const res = await MaganisNative.keepScreenOn({ enabled })
      return Boolean(res.success && res.enabled)
    } catch {
      return false
    }
  }

  // Web fallback: screen wakeLock API
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      if (enabled) {
        const lock = await (
          navigator as unknown as {
            wakeLock: {
              request: (t: string) => Promise<{ release: () => Promise<void> }>
            }
          }
        ).wakeLock.request('screen')
        activeWebLock = lock
        return true
      } else {
        if (activeWebLock) {
          await activeWebLock.release()
          activeWebLock = null
        }
        return false
      }
    } catch {
      return false
    }
  }

  return false
}

// Global web wake lock sentinel tracker
let activeWebLock: { release: () => Promise<void> } | null = null

/**
 * React hook to keep the device screen on during active workouts and cardio sessions.
 * Respects user setting `keepScreenOnEnabled`.
 */
export function useKeepAwake(active: boolean): { isKeepAwakeActive: boolean } {
  const [isActive, setIsActive] = useState(false)
  const isAcquiredRef = useRef(false)

  useEffect(() => {
    const settings = getNotificationSettings()
    const shouldKeepOn = active && settings.keepScreenOnEnabled

    let cancelled = false

    async function applyLock() {
      if (shouldKeepOn) {
        const ok = await setKeepScreenOn(true)
        if (!cancelled) {
          isAcquiredRef.current = ok
          setIsActive(ok)
        }
      } else {
        if (isAcquiredRef.current) {
          await setKeepScreenOn(false)
          if (!cancelled) {
            isAcquiredRef.current = false
            setIsActive(false)
          }
        }
      }
    }

    void applyLock()

    return () => {
      cancelled = true
      if (isAcquiredRef.current) {
        void setKeepScreenOn(false)
        isAcquiredRef.current = false
      }
    }
  }, [active])

  return { isKeepAwakeActive: isActive }
}
