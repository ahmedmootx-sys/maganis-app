/**
 * scripts/native-e2e/suite-safemode-renderer-node.mjs
 * Test Suite for Safe Mode & WebView Renderer Resilience (Task N5).
 * Label: node test (platform layer, mocked)
 */

import {
  checkSafeModeStatus,
  resetCrashLoopCounter,
  exportRawDataSnapshot,
  clearCachesSafe,
} from '../../src/platform/safeMode.ts'
import { setNativeForTesting } from '../../src/platform/runtime.ts'
import {
  setMockSafeModeForTesting,
  MaganisNative,
} from '../../src/platform/native/maganisNative.ts'

export async function runSafeModeAndRendererSuite() {
  console.log(
    '--- RUNNING SAFE MODE & RENDERER SUITE [NODE (platform layer, mocked)] ---',
  )
  const results = []

  // Test S1: Safe Mode Trigger
  try {
    setNativeForTesting(false)
    localStorage.clear()
    await checkSafeModeStatus()
    await checkSafeModeStatus()
    const s3 = await checkSafeModeStatus()
    if (!s3.safeMode || s3.launchCount !== 3) {
      throw new Error(
        `Expected safeMode=true and launchCount=3, got ${JSON.stringify(s3)}`,
      )
    }
    results.push({ id: 'S1-crash-loop-trigger', ok: true })
  } catch (err) {
    results.push({ id: 'S1-crash-loop-trigger', ok: false, error: err.message })
  }

  // Test S2: Raw Snapshot Export
  try {
    localStorage.setItem('maganis:profile.active', '{"name":"كريم"}')
    const exp = await exportRawDataSnapshot()
    if (!exp.success || !exp.fileName.startsWith('maganis-raw-export-')) {
      throw new Error(`Export failed: ${JSON.stringify(exp)}`)
    }
    results.push({ id: 'S2-safe-mode-raw-export', ok: true })
  } catch (err) {
    results.push({
      id: 'S2-safe-mode-raw-export',
      ok: false,
      error: err.message,
    })
  }

  // Test S3: Cache Clearing
  try {
    const cleared = await clearCachesSafe()
    results.push({ id: 'S3-safe-mode-clear-cache', ok: true })
  } catch (err) {
    results.push({
      id: 'S3-safe-mode-clear-cache',
      ok: false,
      error: err.message,
    })
  }

  // Test S4: Safe Mode Reset
  try {
    await resetCrashLoopCounter()
    const fresh = await checkSafeModeStatus()
    if (fresh.safeMode) {
      throw new Error('Safe mode not reset after resetCrashLoopCounter()')
    }
    results.push({ id: 'S4-safe-mode-reset', ok: true })
  } catch (err) {
    results.push({ id: 'S4-safe-mode-reset', ok: false, error: err.message })
  }

  // Test S5: Native Renderer Gone Hook Verification
  try {
    setNativeForTesting(true)
    setMockSafeModeForTesting(false, 0)
    // Verify native plugin exports
    if (
      typeof MaganisNative.isSafeMode !== 'function' ||
      typeof MaganisNative.clearWebViewCache !== 'function'
    ) {
      throw new Error('MaganisNative missing required N5 methods')
    }
    results.push({ id: 'S5-renderer-recovery-hooks', ok: true })
  } catch (err) {
    results.push({
      id: 'S5-renderer-recovery-hooks',
      ok: false,
      error: err.message,
    })
  } finally {
    setNativeForTesting(null)
  }

  return results
}
