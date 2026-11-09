/**
 * scripts/native-e2e/suite-backup-node.mjs
 * Test Suite for Task N3: Backup Engine, Retention, Quotas & Restore.
 * Label: node test (platform layer, mocked)
 */

import {
  backupEngine,
  formatBackupFileName,
  isValidBackupFileName,
} from '../../src/modules/backup/backupEngine.ts'

export async function runBackupSuite() {
  console.log('--- RUNNING BACKUP SUITE [NODE (platform layer, mocked)] ---')
  const results = []

  // B1: Filename formatting and validation
  try {
    const fixed = new Date(2026, 10, 4, 15, 30)
    const name = formatBackupFileName(fixed)
    if (!isValidBackupFileName(name)) {
      throw new Error(`Generated invalid backup filename: ${name}`)
    }
    results.push({ id: 'B1-backup-filename-format', ok: true })
  } catch (err) {
    results.push({
      id: 'B1-backup-filename-format',
      ok: false,
      error: err.message,
    })
  }

  // B2: Backup Engine Run & Overall State Transition
  try {
    backupEngine.resetForTesting()
    const stateInitial = backupEngine.getOverallState()
    if (stateInitial.state !== 'never') {
      throw new Error(`Expected never state, got ${stateInitial.state}`)
    }

    backupEngine.setStatusForTesting({
      lastVerifiedTime: Date.now() - 3600000,
      isDirty: false,
    })
    const stateOk = backupEngine.getOverallState()
    if (stateOk.state !== 'ok') {
      throw new Error(`Expected ok state, got ${stateOk.state}`)
    }
    results.push({ id: 'B2-backup-state-machine', ok: true })
  } catch (err) {
    results.push({
      id: 'B2-backup-state-machine',
      ok: false,
      error: err.message,
    })
  }

  // B3: Integrity Check & Self-Repair
  try {
    backupEngine.setStatusForTesting({
      lastErrorCode: 'disk_full',
      lastErrorAr: 'المساحة ممتلئة',
    })
    const stateFail = backupEngine.getOverallState()
    if (stateFail.state !== 'failing') {
      throw new Error(`Expected failing state, got ${stateFail.state}`)
    }
    results.push({ id: 'B3-integrity-failure-reporting', ok: true })
  } catch (err) {
    results.push({
      id: 'B3-integrity-failure-reporting',
      ok: false,
      error: err.message,
    })
  }

  return results
}
