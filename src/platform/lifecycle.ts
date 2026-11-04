import { platform } from './index.ts'
import { appStorage } from './storage.ts'
import { backupEngine } from '../modules/backup/backupEngine.ts'
import { syncSchedule } from './notifications/notificationEngine.ts'
import { setKeepScreenOn } from './keepAwake.ts'

type LifecycleListener = () => void

const resumeListeners = new Set<LifecycleListener>()
const pauseListeners = new Set<LifecycleListener>()

let isInitialized = false

/**
 * Single, unified lifecycle coordinator for Maganis.
 * Handles backgrounding (pause) and foregrounding (resume) cleanly without screen-by-screen duplication.
 */
export function initLifecycleCoordinator(): () => void {
  if (isInitialized) return () => {}
  isInitialized = true

  const unpause = platform.app.onPause(async () => {
    // 1. Notify pause listeners (active session writes state, records pausedAt/heartbeat)
    for (const listener of pauseListeners) {
      try {
        listener()
      } catch (err) {
        console.error('Error in pause listener:', err)
      }
    }

    // 2. Schedule any timer notifications (rest_end, cardio_end) that depend on backgrounded session
    try {
      await syncSchedule()
    } catch (err) {
      console.warn('Failed to sync schedule on pause:', err)
    }

    // 3. Clear window keep-awake flag when paused
    try {
      await setKeepScreenOn(false)
    } catch {
      // Non-fatal
    }

    // 4. Flush storage writes
    try {
      await appStorage.flush()
    } catch (err) {
      console.error('Failed to flush storage on pause:', err)
    }

    // 5. Trigger backup pause checks (if dirty)
    try {
      backupEngine.onAppPause()
    } catch (err) {
      console.error('Failed to run backup pause checks:', err)
    }
  })

  const unresume = platform.app.onResume(async () => {
    // 1. Recompute schedule and cancel foregrounded timer alarms
    try {
      await syncSchedule()
    } catch (err) {
      console.warn('Failed to sync schedule on resume:', err)
    }

    // 2. Trigger backup resume checks (cadence > 24h & daily integrity)
    try {
      backupEngine.onAppResume()
    } catch (err) {
      console.error('Failed to run backup resume checks:', err)
    }

    // 3. Notify resume listeners (active session recomputes elapsed and validates stale duration)
    for (const listener of resumeListeners) {
      try {
        listener()
      } catch (err) {
        console.error('Error in resume listener:', err)
      }
    }
  })

  return () => {
    unpause()
    unresume()
    isInitialized = false
  }
}

/**
 * Registers a callback invoked whenever the app returns to the foreground.
 */
export function onAppResume(cb: LifecycleListener): () => void {
  resumeListeners.add(cb)
  return () => {
    resumeListeners.delete(cb)
  }
}

/**
 * Registers a callback invoked whenever the app is backgrounded or screen locks.
 */
export function onAppPause(cb: LifecycleListener): () => void {
  pauseListeners.add(cb)
  return () => {
    pauseListeners.delete(cb)
  }
}
