#!/usr/bin/env node
/**
 * scripts/gate-no-raw-vibrate.mjs
 * Gate: enforces that all haptic feedback and device vibration routes through
 * src/platform/haptics.ts and all screen keep-awake routes through src/platform/keepAwake.ts.
 *
 * Direct calls to navigator.vibrate or navigator.wakeLock outside these sanctioned adapters
 * are strictly prohibited to ensure user settings (hapticsEnabled, keepScreenOnEnabled)
 * and native platform implementations are uniformly respected.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const srcDir = path.join(rootDir, 'src')

console.log('=== GATE: NO RAW VIBRATE OR WAKELOCK (Task N4.6) ===\n')

const allowedVibrateFiles = new Set([
  path.normalize(path.join(srcDir, 'platform', 'haptics.ts')),
])

const allowedWakeLockFiles = new Set([
  path.normalize(path.join(srcDir, 'platform', 'keepAwake.ts')),
])

function scanDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      scanDir(fullPath, fileList)
    } else if (
      entry.name.endsWith('.ts') ||
      entry.name.endsWith('.tsx') ||
      entry.name.endsWith('.js') ||
      entry.name.endsWith('.jsx')
    ) {
      fileList.push(fullPath)
    }
  }
  return fileList
}

const files = scanDir(srcDir)
let violations = 0

for (const filePath of files) {
  const normalized = path.normalize(filePath)
  const rel = path.relative(rootDir, filePath).replace(/\\/g, '/')
  const content = fs.readFileSync(filePath, 'utf8')

  if (!allowedVibrateFiles.has(normalized)) {
    if (content.includes('navigator.vibrate')) {
      console.error(
        `[VIOLATION] Raw navigator.vibrate found in ${rel}. Use platform haptics (src/platform/haptics.ts).`,
      )
      violations++
    }
  }

  if (!allowedWakeLockFiles.has(normalized)) {
    if (content.includes('navigator.wakeLock')) {
      console.error(
        `[VIOLATION] Raw navigator.wakeLock found in ${rel}. Use useKeepAwake (src/platform/keepAwake.ts).`,
      )
      violations++
    }
  }
}

if (violations > 0) {
  console.error(
    `\nGate FAILED: Found ${violations} raw device API violations in src/.`,
  )
  process.exit(1)
} else {
  console.log(
    `✓ Gate PASSED: Verified ${files.length} source files. Zero raw navigator.vibrate or navigator.wakeLock calls found.`,
  )
}
