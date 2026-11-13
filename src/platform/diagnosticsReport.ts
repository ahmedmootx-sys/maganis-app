/**
 * src/platform/diagnosticsReport.ts
 * Builds unified, privacy-safe diagnostics report bundle for sharing (Task N5.2).
 */

import { MaganisNative } from './native/maganisNative.ts'
import { isNative } from './runtime.ts'
import { logger } from './logger.ts'
import { storageHealth } from './storageHealth.ts'
import { backupEngine } from '../modules/backup/backupEngine.ts'
import { saveBlobAsFile } from '../utils/saveFile.ts'

export interface DiagnosticsReportData {
  reportText: string
  fileName: string
}

export async function buildDiagnosticsReport(): Promise<DiagnosticsReportData> {
  const timestamp = new Date().toISOString()
  let appVersion = '0.2.1'
  let versionCode = 1
  let buildType = 'release'
  let signingSha256Short = 'unknown'
  let sdkInt = 0
  let deviceModel = 'Web Browser'

  if (isNative() && typeof MaganisNative.getInfo === 'function') {
    try {
      const info = await MaganisNative.getInfo()
      appVersion = info.versionName
      versionCode = Number(info.versionCode)
      buildType = info.buildType
      sdkInt = info.sdkInt
      deviceModel = info.deviceModel
      if (info.signingSha256) {
        signingSha256Short = info.signingSha256.slice(0, 16) + '...'
      }
    } catch {
      // Fallback to default web values
    }
  }

  // Storage health
  const storageSnap = storageHealth.getSnapshot()
  const storageStatus = storageSnap.status
  const corruptCount = storageSnap.corruptKeys.length

  // Backup status
  const backupOverall = backupEngine.getOverallState()
  const backupStat = backupEngine.getStatus()
  const lastBackupStr = backupStat.lastVerifiedTime
    ? new Date(backupStat.lastVerifiedTime).toISOString()
    : 'none'

  // Exit reasons
  let exitReasonsText = 'Android exit reasons: unsupported or none'
  if (isNative() && typeof MaganisNative.getExitReasons === 'function') {
    try {
      const res = await MaganisNative.getExitReasons()
      if (res && res.reasons && res.reasons.length > 0) {
        exitReasonsText = res.reasons
          .map(
            (r) =>
              `  - [${new Date(r.timestamp).toISOString()}] ${r.reasonAr} (code=${r.reasonCode}, pss=${r.pssKb}KB, rss=${r.rssKb}KB)`,
          )
          .join('\n')
      } else {
        exitReasonsText = 'Android exit reasons: none recorded'
      }
    } catch {
      exitReasonsText = 'Android exit reasons: query failed'
    }
  }

  // Native crash logs
  let nativeCrashesText = 'Native crash files: none'
  if (isNative() && typeof MaganisNative.getNativeCrashLogs === 'function') {
    try {
      const crashRes = await MaganisNative.getNativeCrashLogs()
      if (crashRes && crashRes.crashes && crashRes.crashes.length > 0) {
        nativeCrashesText = crashRes.crashes
          .map(
            (c) =>
              `=== CRASH FILE: ${c.filename} (${new Date(c.timestamp).toISOString()}) ===\n${c.content}`,
          )
          .join('\n\n')
      }
    } catch {
      nativeCrashesText = 'Native crash files: query error'
    }
  }

  // Recent logs
  const logs = await logger.getRecentLogs(200)
  const logsText = logs.length > 0 ? logs.join('\n') : 'No log lines recorded.'

  const report = [
    '=================================================================',
    '              BUNYAN DIAGNOSTICS & STABILITY REPORT              ',
    '=================================================================',
    `Generated At:        ${timestamp}`,
    `App Version:         ${appVersion} (${versionCode})`,
    `Build Channel:       ${buildType}`,
    `Signing Fingerprint: ${signingSha256Short}`,
    `Android SDK:         ${sdkInt > 0 ? sdkInt : 'N/A (Web)'}`,
    `Device Model:        ${deviceModel}`,
    '',
    '--- STORAGE & DATA INTEGRITY ---',
    `Storage Status:      ${storageStatus}`,
    `Corrupt Keys Count:  ${corruptCount}`,
    `Disk Free Bytes:     ${storageSnap.freeSpaceBytes ?? 'N/A'}`,
    `Total Stored Keys:   ${storageSnap.keyCount ?? 'N/A'}`,
    '',
    '--- BACKUP GUARANTEE STATUS ---',
    `Backup State:        ${backupOverall.state}`,
    `Last Verified Backup:${lastBackupStr}`,
    `Backup Health:       ${backupOverall.messageAr || 'سليمة'}`,
    '',
    '--- HISTORICAL PROCESS EXIT REASONS ---',
    exitReasonsText,
    '',
    '--- NATIVE CRASH TRACES ---',
    nativeCrashesText,
    '',
    '--- LAST 200 SANITIZED APP LOG LINES ---',
    logsText,
    '=================================================================',
    'End of Bunyan Diagnostics Report.',
  ].join('\n')

  const fileName = `bunyan-diagnostics-${Date.now()}.txt`

  return { reportText: report, fileName }
}

export async function shareDiagnosticsReport(): Promise<boolean> {
  const { reportText, fileName } = await buildDiagnosticsReport()

  const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
  const result = await saveBlobAsFile(blob, fileName)
  return !result.error
}
