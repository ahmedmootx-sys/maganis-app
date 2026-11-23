/**
 * src/platform/autoUpdater.ts
 *
 * In-App Auto-Updater Service & Coordinator for Bunyan.
 *
 * Capabilities:
 * - Checks GitHub Releases API for new version releases with APK assets.
 * - Compares current semver against latest release tag.
 * - Non-intrusive background startup check with throttling and offline resilience.
 * - Pre-update verified backup guarantee before download.
 * - Native Android APK download via system DownloadManager and automatic install prompt.
 * - State management and React hook for banners and modal prompts.
 */

import { useState, useEffect } from 'react'
import {
  checkForUpdates,
  getAutoUpdateSetting,
  setAutoUpdateSetting,
  type UpdateCheckResult,
  type UpdateCheckStatus,
} from './updateChecker.ts'
import { isNative } from './runtime.ts'
import { MaganisNative } from './native/maganisNative.ts'
import { backupEngine } from '../modules/backup/backupEngine.ts'
import { openExternalUrl } from '../utils/urlHelper.ts'
import { logger } from './logger.ts'
import { appStorage } from './storage.ts'

export interface AutoUpdaterState {
  isChecking: boolean
  isDownloading: boolean
  status: UpdateCheckStatus | 'idle'
  updateAvailable: boolean
  result: UpdateCheckResult | null
  showPrompt: boolean
  backupWarning: string | null
  lastCheckedAt: number | null
}

type AutoUpdateListener = (state: AutoUpdaterState) => void

const DEFAULT_APP_VERSION = '0.2.2'
const STORAGE_KEY_LAST_CHECK = 'maganis:update.last_check_timestamp'
const THROTTLE_WINDOW_MS = 2 * 60 * 60 * 1000 // 2 hours

class AutoUpdaterService {
  private state: AutoUpdaterState = {
    isChecking: false,
    isDownloading: false,
    status: 'idle',
    updateAvailable: false,
    result: null,
    showPrompt: false,
    backupWarning: null,
    lastCheckedAt: this.getStoredLastCheck(),
  }

  private listeners = new Set<AutoUpdateListener>()
  private checkPromise: Promise<UpdateCheckResult> | null = null
  private initialized = false

  private getStoredLastCheck(): number | null {
    try {
      const saved = appStorage.getItem(STORAGE_KEY_LAST_CHECK)
      return saved ? parseInt(saved, 10) : null
    } catch {
      return null
    }
  }

  private setStoredLastCheck(timestamp: number): void {
    try {
      appStorage.setItem(STORAGE_KEY_LAST_CHECK, String(timestamp))
    } catch {
      // ignore
    }
  }

  public getState(): AutoUpdaterState {
    return { ...this.state }
  }

  public subscribe(listener: AutoUpdateListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(): void {
    const currentState = this.getState()
    for (const listener of this.listeners) {
      try {
        listener(currentState)
      } catch (err) {
        console.warn('[AutoUpdater] listener error:', err)
      }
    }
  }

  /**
   * Reads current application version and build type.
   */
  public async getAppVersionInfo(): Promise<{
    versionName: string
    buildType: 'debug' | 'release'
  }> {
    let versionName = DEFAULT_APP_VERSION
    let buildType: 'debug' | 'release' = 'release'

    if (isNative() && typeof MaganisNative.getInfo === 'function') {
      try {
        const info = await MaganisNative.getInfo()
        if (info.versionName) versionName = info.versionName
        if (info.buildType) {
          buildType = info.buildType === 'debug' ? 'debug' : 'release'
        }
      } catch {
        // Fall back to defaults
      }
    }

    return { versionName, buildType }
  }

  /**
   * Initializes the auto-updater on application launch.
   */
  public init(): () => void {
    if (this.initialized) {
      return () => {}
    }
    this.initialized = true

    // Check on startup if enabled and outside throttle window
    if (getAutoUpdateSetting()) {
      const now = Date.now()
      const lastCheck = this.state.lastCheckedAt ?? 0
      const isThrottled = now - lastCheck < THROTTLE_WINDOW_MS

      if (!isThrottled) {
        // Run with slight startup delay to not block initial render
        const timer = setTimeout(() => {
          void this.checkForUpdates(false).catch((err) => {
            logger.warn('UPDATE', 'AUTO_CHECK_FAIL', String(err))
          })
        }, 2500)

        const handleOnline = () => {
          if (!this.state.updateAvailable && !this.state.isChecking) {
            void this.checkForUpdates(false).catch(() => {})
          }
        }

        if (typeof window !== 'undefined') {
          window.addEventListener('online', handleOnline)
        }

        return () => {
          clearTimeout(timer)
          if (typeof window !== 'undefined') {
            window.removeEventListener('online', handleOnline)
          }
        }
      }
    }

    return () => {}
  }

  /**
   * Performs an update check against GitHub Releases API.
   * If force is true, bypasses throttle window.
   */
  public async checkForUpdates(force = false): Promise<UpdateCheckResult> {
    if (this.checkPromise) {
      return this.checkPromise
    }

    const now = Date.now()
    if (!force && this.state.result && this.state.lastCheckedAt) {
      if (now - this.state.lastCheckedAt < THROTTLE_WINDOW_MS) {
        return this.state.result
      }
    }

    this.state.isChecking = true
    this.state.backupWarning = null
    this.emit()

    this.checkPromise = (async () => {
      try {
        const { versionName, buildType } = await this.getAppVersionInfo()
        const result = await checkForUpdates(versionName, buildType)

        const nowTs = Date.now()
        this.setStoredLastCheck(nowTs)

        const isAvailable = result.status === 'update_available'

        this.state = {
          ...this.state,
          isChecking: false,
          status: result.status,
          updateAvailable: isAvailable,
          result,
          showPrompt: isAvailable ? true : false,
          lastCheckedAt: nowTs,
        }

        this.emit()
        return result
      } catch (err) {
        logger.error('UPDATE', 'CHECK_EXCEPTION', String(err))
        const errorResult: UpdateCheckResult = {
          status: 'error',
          currentVersion: DEFAULT_APP_VERSION,
          messageAr: 'حدث خطأ غير متوقع أثناء فحص التحديثات.',
        }
        this.state = {
          ...this.state,
          isChecking: false,
          status: 'error',
          result: errorResult,
        }
        this.emit()
        return errorResult
      } finally {
        this.checkPromise = null
      }
    })()

    return this.checkPromise
  }

  public dismissPrompt(): void {
    this.state.showPrompt = false
    this.emit()
  }

  public openPrompt(): void {
    if (this.state.updateAvailable) {
      this.state.showPrompt = true
      this.emit()
    }
  }

  /**
   * Executes verified pre-update backup and initiates APK download & installation.
   */
  public async downloadAndInstall(): Promise<{
    success: boolean
    method?: string
    error?: string
  }> {
    const downloadUrl = this.state.result?.downloadUrl
    if (!downloadUrl) {
      return { success: false, error: 'رابط التحميل غير متوفر.' }
    }

    this.state.isDownloading = true
    this.state.backupWarning = null
    this.emit()

    // 1. Mandatory Pre-update Verified Backup Guarantee
    try {
      const backupRes = await backupEngine.runBackup('pre-update')
      if (!backupRes.success) {
        const warn = `تنبيه: تعذر إنشاء نسخة احتياطية مسبقة تلقائياً (${backupRes.errorAr || 'خطأ غير متوقع'}).`
        this.state.backupWarning = warn
        this.emit()
      }
    } catch (backupErr) {
      this.state.backupWarning = `تنبيه: خطأ في النسخ الاحتياطي: ${String(backupErr)}`
      this.emit()
    }

    // 2. Native Android APK Download and Install Prompt
    try {
      if (
        isNative() &&
        typeof MaganisNative.downloadAndInstallApk === 'function'
      ) {
        const fileName = this.state.result?.latestVersion
          ? `bunyan-${this.state.result.latestVersion}.apk`
          : undefined
        const nativeRes = await MaganisNative.downloadAndInstallApk({
          url: downloadUrl,
          fileName,
        })
        this.state.isDownloading = false
        this.emit()
        return { success: true, method: nativeRes.method }
      }

      // Universal fallback (browser / external intent)
      const opened = await openExternalUrl(downloadUrl)
      this.state.isDownloading = false
      this.emit()
      return { success: opened, method: 'external_browser' }
    } catch (err) {
      logger.error('UPDATE', 'DOWNLOAD_ERROR', String(err))
      // Final fallback to opening external URL
      await openExternalUrl(downloadUrl)
      this.state.isDownloading = false
      this.emit()
      return { success: true, method: 'fallback_browser' }
    }
  }

  public setAutoCheckEnabled(enabled: boolean): void {
    setAutoUpdateSetting(enabled)
    if (enabled && !this.state.updateAvailable) {
      void this.checkForUpdates(true).catch(() => {})
    }
  }
}

export const autoUpdater = new AutoUpdaterService()

/**
 * React Hook for consuming AutoUpdater state and actions.
 */
export function useAutoUpdater() {
  const [state, setState] = useState<AutoUpdaterState>(() =>
    autoUpdater.getState(),
  )

  useEffect(() => {
    return autoUpdater.subscribe(setState)
  }, [])

  return {
    ...state,
    autoCheckEnabled: getAutoUpdateSetting(),
    checkForUpdates: (force = true) => autoUpdater.checkForUpdates(force),
    downloadAndInstall: () => autoUpdater.downloadAndInstall(),
    dismissPrompt: () => autoUpdater.dismissPrompt(),
    openPrompt: () => autoUpdater.openPrompt(),
    setAutoCheckEnabled: (enabled: boolean) =>
      autoUpdater.setAutoCheckEnabled(enabled),
  }
}
