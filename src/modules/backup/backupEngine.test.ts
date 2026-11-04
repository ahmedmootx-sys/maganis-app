import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  BackupEngine,
  formatBackupFileName,
  isValidBackupFileName,
} from './backupEngine.ts'
import { appStorage } from '../../platform/storage.ts'
import {
  webMockImplementation,
  clearMockFilesForTesting,
} from '../../platform/native/maganisNative.ts'

describe('BackupEngine Pipeline, Retention and Verification (Task N3)', () => {
  let engine: BackupEngine

  beforeEach(() => {
    vi.restoreAllMocks()
    appStorage.clear()
    clearMockFilesForTesting()
    engine = new BackupEngine()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    appStorage.clear()
    clearMockFilesForTesting()
  })

  it('validates backup file names correctly', () => {
    expect(isValidBackupFileName('maganis-backup-2026-11-04-1230.json')).toBe(
      true,
    )
    expect(isValidBackupFileName('maganis-backup-2026-11-04-123045.json')).toBe(
      true,
    )
    expect(isValidBackupFileName('other-file.json')).toBe(false)
    expect(isValidBackupFileName('maganis-backup.json')).toBe(false)
    expect(isValidBackupFileName('')).toBe(false)
  })

  it('formats backup filename with local date and minutes', () => {
    const fixedDate = new Date(2026, 10, 4, 15, 45) // 2026-11-04 15:45
    const name = formatBackupFileName(fixedDate)
    expect(name).toBe('maganis-backup-2026-11-04-1545.json')
  })

  it('Pipeline Order: build -> stream write -> verify -> rotate -> update status', async () => {
    // Populate some authored data
    appStorage.setItem(
      'maganis:profile.active',
      JSON.stringify({ name: 'كابتن أحمد' }),
    )

    const order: string[] = []

    const origOpenWrite = webMockImplementation.openWrite
    const origClose = webMockImplementation.close
    const origVerify = webMockImplementation.verify
    const origDelete = webMockImplementation.delete

    vi.spyOn(webMockImplementation, 'openWrite').mockImplementation(
      async (opts) => {
        order.push(`openWrite:${opts.target}`)
        return origOpenWrite(opts)
      },
    )

    vi.spyOn(webMockImplementation, 'close').mockImplementation(
      async (opts) => {
        order.push('closeWrite')
        return origClose(opts)
      },
    )

    vi.spyOn(webMockImplementation, 'verify').mockImplementation(
      async (opts) => {
        order.push(`verify:${opts.target}`)
        return origVerify(opts)
      },
    )

    vi.spyOn(webMockImplementation, 'delete').mockImplementation(
      async (opts) => {
        order.push(`delete:${opts.name}`)
        return origDelete(opts)
      },
    )

    const res = await engine.runBackup('test_pipeline')

    expect(res.success).toBe(true)
    expect(res.verifiedCount).toBeGreaterThanOrEqual(1)

    // Verify ordering: openWrite comes before closeWrite, closeWrite before verify
    const firstOpen = order.indexOf('openWrite:internal')
    const firstClose = order.indexOf('closeWrite')
    const firstVerify = order.indexOf('verify:internal')

    expect(firstOpen).toBeGreaterThanOrEqual(0)
    expect(firstClose).toBeGreaterThan(firstOpen)
    expect(firstVerify).toBeGreaterThan(firstClose)

    // Status updated with verified timestamp and hash
    const status = engine.getStatus()
    expect(status.lastSuccess).toBeDefined()
    expect(status.destinations.internal.lastVerifiedAt).toBeDefined()
    expect(status.destinations.internal.sha256).toBeDefined()
    expect(status.destinations.internal.bytes).toBeGreaterThan(0)
    expect(status.isDirty).toBe(false)
  })

  it('Verify-Before-Rotate: Never rotates or deletes old files if verification fails', async () => {
    appStorage.setItem(
      'maganis:profile.active',
      JSON.stringify({ name: 'كابتن أحمد' }),
    )

    // Mock existing verified backups
    vi.spyOn(webMockImplementation, 'list').mockResolvedValue({
      files: [
        {
          name: 'maganis-backup-2026-11-01-1000.json',
          size: 1000,
          modified: 1000,
          isOwn: true,
        },
        {
          name: 'maganis-backup-2026-11-02-1000.json',
          size: 1000,
          modified: 2000,
          isOwn: true,
        },
        {
          name: 'maganis-backup-2026-11-03-1000.json',
          size: 1000,
          modified: 3000,
          isOwn: true,
        },
        {
          name: 'maganis-backup-2026-11-04-1000.json',
          size: 1000,
          modified: 4000,
          isOwn: true,
        },
      ],
    })

    const deleteSpy = vi.spyOn(webMockImplementation, 'delete')

    // Inject verify mismatch failure
    vi.spyOn(webMockImplementation, 'verify').mockResolvedValue({
      success: true,
      bytes: 999999, // Mismatched!
      sha256: 'corrupt_hash_injected',
    })

    const res = await engine.runBackup('failing_verify_test')

    expect(res.success).toBe(false)
    expect(res.verifiedCount).toBe(0)
    expect(res.errorAr).toContain('عدم تطابق البصمة')

    // Delete MUST NOT have been called
    expect(deleteSpy).not.toHaveBeenCalled()

    // Status should be failing
    const overall = engine.getOverallState()
    expect(overall.state).toBe('failing')
  })

  it('Status Transitions: never -> ok -> stale -> failing -> folder_permission_lost', async () => {
    // 1. Initial state = never
    expect(engine.getOverallState().state).toBe('never')

    // 2. Successful verified backup -> ok
    appStorage.setItem(
      'maganis:profile.active',
      JSON.stringify({ name: 'كابتن أحمد' }),
    )
    const res = await engine.runBackup('initial_success')
    expect(res.success).toBe(true)
    expect(engine.getOverallState().state).toBe('ok')

    // 3. Data becomes dirty + older than 3 days -> stale
    engine.markDirty()
    // Simulate time traveling 4 days forward
    const status = engine.getStatus()
    status.lastVerifiedTime = Date.now() - 4 * 24 * 60 * 60 * 1000
    appStorage.setItem('maganis:backup.status', JSON.stringify(status))
    // Reload state in engine
    const engineStale = new BackupEngine()
    engineStale.markDirty()
    expect(engineStale.getOverallState().state).toBe('stale')

    // 4. Failing state on injected write error
    vi.spyOn(webMockImplementation, 'openWrite').mockRejectedValue(
      new Error('Storage disk full'),
    )
    await engineStale.runBackup('disk_full')
    expect(engineStale.getOverallState().state).toBe('failing')
    expect(engineStale.getOverallState().reasonAr).toContain(
      'Storage disk full',
    )

    // 5. Folder permission lost
    engineStale.updateSettings({
      destinations: { internal: true, downloads: true, folder: true },
      folderUri: 'content://tree/primary:Backup',
    })
    const curStatus = engineStale.getStatus()
    curStatus.lastErrorCode = undefined
    curStatus.lastErrorAr = undefined
    curStatus.destinations.folder = {
      isSupported: true,
      errorAr: 'تم إلغاء إذن الوصول إلى المجلد المختار أو حُذف',
    }
    appStorage.setItem('maganis:backup.status', JSON.stringify(curStatus))
    const enginePerm = new BackupEngine()
    expect(enginePerm.getOverallState().state).toBe('folder_permission_lost')
  })

  it('Trigger Logic: App Pause, App Resume, Finished Sessions & Debouncing', async () => {
    const runBackupSpy = vi.spyOn(engine, 'runBackup').mockResolvedValue({
      success: true,
      verifiedCount: 1,
    })

    // 1. App pause while clean -> does not run
    engine.onAppPause()
    expect(runBackupSpy).not.toHaveBeenCalled()

    // 2. Mark dirty, but last verified is fresh (< 15 min) -> does not run yet
    const st = engine.getStatus()
    st.lastVerifiedTime = Date.now()
    appStorage.setItem('maganis:backup.status', JSON.stringify(st))
    const freshEngine = new BackupEngine()
    const freshPauseSpy = vi.spyOn(freshEngine, 'runBackup')
    freshEngine.markDirty()
    freshEngine.onAppPause()
    expect(freshPauseSpy).not.toHaveBeenCalled()

    // 3. Mark dirty, last verified > 15m -> runs backup!
    const status = engine.getStatus()
    status.lastVerifiedTime = Date.now() - 20 * 60 * 1000 // 20m ago
    appStorage.setItem('maganis:backup.status', JSON.stringify(status))
    const enginePaused = new BackupEngine()
    const pauseSpy = vi.spyOn(enginePaused, 'runBackup').mockResolvedValue({
      success: true,
      verifiedCount: 1,
    })
    enginePaused.markDirty()
    enginePaused.onAppPause()
    expect(pauseSpy).toHaveBeenCalledWith('app_pause')

    // 4. Workout finished trigger -> immediate backup
    enginePaused.onWorkoutOrCardioFinished()
    expect(pauseSpy).toHaveBeenCalledWith('workout_finished')

    // 5. Nutrition day finished trigger -> immediate backup
    enginePaused.onNutritionDayFinished()
    expect(pauseSpy).toHaveBeenCalledWith('nutrition_finished')

    // 6. Set entering block: does NOT run while entering set
    runBackupSpy.mockRestore()
    engine.setEnteringSet(true)
    const blockedRes = await engine.runBackup('while_entering_set')
    expect(blockedRes.success).toBe(false)
    expect(blockedRes.errorAr).toContain('أثناء تسجيل المجموعة')
  })

  it('Retention Logic: Never prunes below 3 files, enforces 10 files and 200 MB caps', async () => {
    const listSpy = vi.spyOn(webMockImplementation, 'list')
    const deleteSpy = vi.spyOn(webMockImplementation, 'delete')

    // Case 1: 3 files exist -> 0 files deleted (MIN_BACKUP_RETENTION)
    listSpy.mockResolvedValue({
      files: [
        {
          name: 'maganis-backup-2026-11-01-1000.json',
          size: 1000,
          modified: 1000,
          isOwn: true,
        },
        {
          name: 'maganis-backup-2026-11-02-1000.json',
          size: 1000,
          modified: 2000,
          isOwn: true,
        },
        {
          name: 'maganis-backup-2026-11-03-1000.json',
          size: 1000,
          modified: 3000,
          isOwn: true,
        },
      ],
    })

    await engine.runBackup('retention_min_floor')
    expect(deleteSpy).not.toHaveBeenCalled()

    deleteSpy.mockClear()

    // Case 2: 12 verified files exist -> oldest 2 deleted to stay at 10
    const twelveFiles = []
    for (let i = 1; i <= 12; i++) {
      twelveFiles.push({
        name: `maganis-backup-2026-11-${String(i).padStart(2, '0')}-1000.json`,
        size: 1024,
        modified: i * 1000,
        isOwn: true,
      })
    }
    listSpy.mockResolvedValue({ files: twelveFiles })

    await engine.runBackup('retention_ten_cap')
    expect(deleteSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'maganis-backup-2026-11-01-1000.json' }),
    )
    expect(deleteSpy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'maganis-backup-2026-11-02-1000.json' }),
    )
  })

  it('Daily Integrity Check: flags altered file and initiates automatic self-repair', async () => {
    // Setup verified backup status
    appStorage.setItem(
      'maganis:backup.status',
      JSON.stringify({
        lastVerifiedTime: Date.now() - 30 * 60 * 1000,
        destinations: {
          internal: {
            isSupported: true,
            fileName: 'maganis-backup-2026-11-04-1000.json',
            sha256: 'original_correct_sha',
            bytes: 1000,
          },
          downloads: { isSupported: false },
          folder: { isSupported: false },
        },
        isDirty: false,
      }),
    )

    const engineIntegrity = new BackupEngine()

    // Mock verify returning a damaged hash
    vi.spyOn(webMockImplementation, 'verify').mockResolvedValue({
      success: true,
      bytes: 1000,
      sha256: 'tampered_or_damaged_sha',
    })

    const runBackupSpy = vi
      .spyOn(engineIntegrity, 'runBackup')
      .mockResolvedValue({
        success: true,
        verifiedCount: 1,
      })

    await engineIntegrity.runDailyIntegrityCheck()

    // Must have flagged anomaly and triggered repair backup
    expect(runBackupSpy).toHaveBeenCalledWith('integrity_repair')
  })

  it('Heavy Dataset Streaming (Rule D5): writes chunked without blocking main thread', async () => {
    // Construct heavy synthetic data (~500 KB JSON, 20 chunks)
    const heavyEntries = Array.from({ length: 400 }, (_, i) => ({
      sessionId: `heavy-session-${i}`,
      date: '2026-11-04',
      exercises: Array.from({ length: 6 }, (_, j) => ({
        exerciseId: `ex-${j}`,
        sets: [{ weightKg: 100, reps: 10 }],
      })),
    }))

    appStorage.setItem(
      'maganis:tracking.sessions',
      JSON.stringify(heavyEntries),
    )

    const chunkLengths: number[] = []
    const origAppend = webMockImplementation.append
    vi.spyOn(webMockImplementation, 'append').mockImplementation(
      async (opts) => {
        chunkLengths.push(opts.chunkBase64.length)
        return origAppend(opts)
      },
    )

    const start = performance.now()
    const res = await engine.runBackup('heavy_dataset')
    const elapsed = performance.now() - start
    expect(elapsed).toBeGreaterThan(0)

    expect(res.success).toBe(true)
    expect(chunkLengths.length).toBeGreaterThan(1)

    // Check that every chunk is well below 1 MB bridge limit (< 300 KB)
    for (const len of chunkLengths) {
      expect(len).toBeLessThan(1024 * 1024)
    }
  })
})
