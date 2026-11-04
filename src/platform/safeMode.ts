/**
 * src/platform/safeMode.ts
 * Crash-Loop Protection & Safe Mode Coordinator (Task N5.3).
 *
 * Requirements:
 * 1. Checks crash loop status before importing the main app bundle.
 * 2. If 3 launches occur within 3 minutes without reaching 30s healthy uptime, safe mode is triggered.
 * 3. Provides raw snapshot export (no app code), diagnostics sharing, webview cache clearing, and reset.
 */

import { MaganisNative } from './native/maganisNative.ts'
import { isNative } from './runtime.ts'
import { saveBlobAsFile } from '../utils/saveFile.ts'

export interface SafeModeStatus {
  safeMode: boolean
  launchCount: number
}

const STORAGE_KEY_LAUNCHES = 'maganis:crash_loop_launches'
const STORAGE_KEY_DEBUG_FORCE = 'maganis:debug_force_safe_mode'
const THREE_MINUTES_MS = 3 * 60 * 1000
const MAX_RAPID_STARTS = 3

/**
 * Checks whether the app should enter Safe Mode.
 * Must be executable BEFORE importing React app or heavy store modules.
 */
export async function checkSafeModeStatus(): Promise<SafeModeStatus> {
  // Check URL param or debug flag for testing
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    if (
      urlParams.get('safe_mode') === '1' ||
      sessionStorage.getItem(STORAGE_KEY_DEBUG_FORCE) === '1'
    ) {
      return { safeMode: true, launchCount: 3 }
    }
    // Automated end-to-end browser drivers (Playwright / WebDriver) bypass crash-loop limits
    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      return { safeMode: false, launchCount: 0 }
    }
  }

  if (isNative() && typeof MaganisNative.isSafeMode === 'function') {
    try {
      const res = await MaganisNative.isSafeMode()
      return {
        safeMode: Boolean(res.safeMode),
        launchCount: Number(res.launchCount || 0),
      }
    } catch {
      // Fall through to local storage tracking
    }
  }

  // Web / Fallback crash-loop tracker
  try {
    if (typeof localStorage === 'undefined') {
      return { safeMode: false, launchCount: 0 }
    }

    const raw = localStorage.getItem(STORAGE_KEY_LAUNCHES)
    const now = Date.now()
    const timestamps: number[] = raw
      ? raw
          .split(',')
          .map((n) => Number(n.trim()))
          .filter((t) => Number.isFinite(t) && now - t <= THREE_MINUTES_MS)
      : []

    timestamps.push(now)
    const shouldEnterSafeMode = timestamps.length >= MAX_RAPID_STARTS
    localStorage.setItem(STORAGE_KEY_LAUNCHES, timestamps.join(','))

    // Set 30-second healthy reset
    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        try {
          localStorage.removeItem(STORAGE_KEY_LAUNCHES)
        } catch {
          // ignore
        }
      }, 30000)
    }

    return {
      safeMode: shouldEnterSafeMode,
      launchCount: timestamps.length,
    }
  } catch {
    return { safeMode: false, launchCount: 0 }
  }
}

/**
 * Clears crash loop counters so the app can launch normally on next start.
 */
export async function resetCrashLoopCounter(): Promise<boolean> {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY_DEBUG_FORCE)
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_LAUNCHES)
    }
    if (isNative() && typeof MaganisNative.resetCrashLoop === 'function') {
      await MaganisNative.resetCrashLoop()
    }
    return true
  } catch {
    return false
  }
}

/**
 * Clears WebView caches without touching user databases or files.
 */
export async function clearCachesSafe(): Promise<boolean> {
  let cleared = false
  if (isNative() && typeof MaganisNative.clearWebViewCache === 'function') {
    try {
      await MaganisNative.clearWebViewCache()
      cleared = true
    } catch {
      // ignore
    }
  }

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const keys = await caches.keys()
      for (const k of keys) {
        await caches.delete(k)
      }
      cleared = true
    } catch {
      // ignore
    }
  }

  return cleared
}

/**
 * Performs raw export of KV and media directly through native plugin without touching app code.
 */
export async function exportRawDataSnapshot(): Promise<{
  success: boolean
  fileName: string
  errorAr?: string
}> {
  if (isNative() && typeof MaganisNative.exportRawSnapshot === 'function') {
    try {
      const res = await MaganisNative.exportRawSnapshot()
      return { success: true, fileName: res.fileName }
    } catch (err) {
      return { success: false, fileName: '', errorAr: String(err) }
    }
  }

  // Web fallback: Read localStorage directly
  try {
    const rawDump: Record<string, string> = {}
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('maganis')) {
          rawDump[key] = localStorage.getItem(key) || ''
        }
      }
    }

    const payload = {
      format: 'maganis-snapshot-raw-dump',
      version: 2,
      exportedAt: Date.now(),
      source: 'web-safe-mode-dump',
      kv: rawDump,
    }

    const fileName = `maganis-raw-export-${Date.now()}.json`
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const res = await saveBlobAsFile(blob, fileName)
    return { success: !res.error, fileName, errorAr: res.error }
  } catch (err) {
    return { success: false, fileName: '', errorAr: String(err) }
  }
}
