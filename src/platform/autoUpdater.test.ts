import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { autoUpdater } from './autoUpdater.ts'
import * as updateCheckerModule from './updateChecker.ts'
import { webMockImplementation } from './native/maganisNative.ts'
import { backupEngine } from '../modules/backup/backupEngine.ts'
import * as urlHelperModule from '../utils/urlHelper.ts'
import { setNativeForTesting } from './runtime.ts'

describe('In-App Auto-Updater Service (autoUpdater)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    setNativeForTesting(null)
    autoUpdater.dismissPrompt()
  })

  afterEach(() => {
    setNativeForTesting(null)
    vi.restoreAllMocks()
  })

  it('provides initial state and allows subscribing to updates', () => {
    const listener = vi.fn()
    const unsubscribe = autoUpdater.subscribe(listener)

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        isChecking: false,
        isDownloading: false,
        updateAvailable: false,
        showPrompt: false,
      }),
    )

    unsubscribe()
  })

  it('checks for updates, detects new release, and updates state', async () => {
    vi.spyOn(updateCheckerModule, 'checkForUpdates').mockResolvedValue({
      status: 'update_available',
      currentVersion: '0.2.2',
      latestVersion: '0.2.3',
      downloadUrl:
        'https://github.com/ahmedmootx-sys/maganis-app/releases/download/v0.2.3/bunyan-0.2.3.apk',
      apkSizeMb: 31.5,
      releaseDate: '2026-11-15',
      releaseNotesAr: ['إضافة فاحص التحديثات التلقائي', 'تحسينات في الأداء'],
      messageAr: 'يتوفر تحديث جديد (v0.2.3).',
      hasApkAsset: true,
    })

    const res = await autoUpdater.checkForUpdates(true)

    expect(res.status).toBe('update_available')
    expect(res.latestVersion).toBe('0.2.3')

    const state = autoUpdater.getState()
    expect(state.updateAvailable).toBe(true)
    expect(state.showPrompt).toBe(true)
    expect(state.result?.downloadUrl).toContain('bunyan-0.2.3.apk')
  })

  it('allows dismissing and reopening the prompt modal', () => {
    autoUpdater.dismissPrompt()
    expect(autoUpdater.getState().showPrompt).toBe(false)

    autoUpdater.openPrompt()
    // only opens if updateAvailable is true
    if (autoUpdater.getState().updateAvailable) {
      expect(autoUpdater.getState().showPrompt).toBe(true)
    }
  })

  it('downloadAndInstall: guarantees verified pre-update backup and invokes native APK download', async () => {
    setNativeForTesting(true)
    const backupSpy = vi.spyOn(backupEngine, 'runBackup').mockResolvedValue({
      success: true,
      verifiedCount: 1,
    })

    const nativeDownloadSpy = vi
      .spyOn(webMockImplementation, 'downloadAndInstallApk')
      .mockResolvedValue({
        success: true,
        downloadId: 999,
        fileName: 'bunyan-0.2.3.apk',
        method: 'download_manager',
      })

    const result = await autoUpdater.downloadAndInstall()

    expect(backupSpy).toHaveBeenCalledWith('pre-update')
    expect(nativeDownloadSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('bunyan-0.2.3.apk'),
      }),
    )
    expect(result.success).toBe(true)
    expect(result.method).toBe('download_manager')
  })

  it('downloadAndInstall: alerts user if pre-update backup fails but proceeds safely', async () => {
    setNativeForTesting(true)
    vi.spyOn(backupEngine, 'runBackup').mockResolvedValue({
      success: false,
      verifiedCount: 0,
      errorAr: 'المساحة ممتلئة',
    })

    vi.spyOn(webMockImplementation, 'downloadAndInstallApk').mockResolvedValue({
      success: true,
      downloadId: 1000,
      method: 'download_manager',
    })

    const result = await autoUpdater.downloadAndInstall()

    expect(result.success).toBe(true)
    const state = autoUpdater.getState()
    expect(state.backupWarning).toContain('المساحة ممتلئة')
  })

  it('downloadAndInstall: falls back to external URL opener if native download fails', async () => {
    vi.spyOn(backupEngine, 'runBackup').mockResolvedValue({
      success: true,
      verifiedCount: 1,
    })

    setNativeForTesting(true)
    vi.spyOn(webMockImplementation, 'downloadAndInstallApk').mockRejectedValue(
      new Error('DownloadManager not available'),
    )

    const urlSpy = vi
      .spyOn(urlHelperModule, 'openExternalUrl')
      .mockResolvedValue(true)

    const result = await autoUpdater.downloadAndInstall()

    expect(urlSpy).toHaveBeenCalledWith(
      expect.stringContaining('bunyan-0.2.3.apk'),
    )
    expect(result.success).toBe(true)
  })

  it('handles offline or network errors gracefully without crashing', async () => {
    vi.spyOn(updateCheckerModule, 'checkForUpdates').mockResolvedValue({
      status: 'offline',
      currentVersion: '0.2.2',
      messageAr: 'مفيش اتصال بالإنترنت حالياً؛ اتأكد من الشبكة وجرب تاني.',
    })

    const res = await autoUpdater.checkForUpdates(true)
    expect(res.status).toBe('offline')

    const state = autoUpdater.getState()
    expect(state.updateAvailable).toBe(false)
    expect(state.showPrompt).toBe(false)
  })
})
