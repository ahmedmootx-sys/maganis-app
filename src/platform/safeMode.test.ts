import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  checkSafeModeStatus,
  resetCrashLoopCounter,
  exportRawDataSnapshot,
} from './safeMode.ts'
import { setMockSafeModeForTesting } from './native/maganisNative.ts'
import { setNativeForTesting } from './runtime.ts'

describe('Crash-Loop Safe Mode (Task N5.3)', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    setNativeForTesting(null)
    setMockSafeModeForTesting(false, 0)
  })

  afterEach(() => {
    setNativeForTesting(null)
  })

  it('normal startup: safeMode is false on single launch', async () => {
    const status = await checkSafeModeStatus()
    expect(status.safeMode).toBe(false)
    expect(status.launchCount).toBe(1)
  })

  it('rapid restart detection: enters safeMode after 3 launches within 3 minutes', async () => {
    // Launch 1
    await checkSafeModeStatus()
    // Launch 2
    await checkSafeModeStatus()
    // Launch 3
    const status3 = await checkSafeModeStatus()

    expect(status3.safeMode).toBe(true)
    expect(status3.launchCount).toBe(3)
  })

  it('resetCrashLoopCounter: resets crash loop state and allows normal boot', async () => {
    // Simulate safe mode state
    await checkSafeModeStatus()
    await checkSafeModeStatus()
    await checkSafeModeStatus()

    const res = await resetCrashLoopCounter()
    expect(res).toBe(true)

    // Next boot is fresh
    const nextStatus = await checkSafeModeStatus()
    expect(nextStatus.safeMode).toBe(false)
    expect(nextStatus.launchCount).toBe(1)
  })

  it('exportRawDataSnapshot: exports raw dump without importing React app modules', async () => {
    localStorage.setItem(
      'maganis:profile.active',
      JSON.stringify({ name: 'كريم' }),
    )
    localStorage.setItem('maganis:test_key', 'test-value')

    const res = await exportRawDataSnapshot()
    expect(res.success).toBe(true)
    expect(res.fileName).toMatch(/^maganis-raw-export-\d+\.json$/)
  })

  it('respects native isSafeMode plugin response when running in native shell', async () => {
    setNativeForTesting(true)
    setMockSafeModeForTesting(true, 4)

    const status = await checkSafeModeStatus()
    expect(status.safeMode).toBe(true)
    expect(status.launchCount).toBe(4)
  })
})
