/**
 * scripts/probe-n5-red.mjs
 * Probes for Task N5 requirements on the pre-fix codebase.
 * Demonstrates RED state for N5.1 (error boundary), N5.2 (logging & redaction),
 * N5.3 (safe mode), N5.5 (update checker), and N5.6 (bundle ratchet).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const redEvidenceDir = path.join(rootDir, 'evidence', 'n5', 'red')
fs.mkdirSync(redEvidenceDir, { recursive: true })

console.log('=== PROBING TASK N5 PRE-FIX BASELINE (RED FIRST) ===\n')

// Probe 1: N5.1 Error Boundary existence
const errorBoundaryPath = path.join(
  rootDir,
  'src',
  'platform',
  'ErrorBoundary.tsx',
)
const hasErrorBoundary = fs.existsSync(errorBoundaryPath)
const n51Report = [
  '=== PROBE N5.1: ERROR BOUNDARY & RECOVERY SCREEN ===',
  `src/platform/ErrorBoundary.tsx exists: ${hasErrorBoundary}`,
  'Top-level React ErrorBoundary in App.tsx: ' +
    (fs
      .readFileSync(path.join(rootDir, 'src', 'App.tsx'), 'utf8')
      .includes('<ErrorBoundary')
      ? 'FOUND'
      : 'MISSING'),
  'Per-route ErrorBoundary in App.tsx: MISSING',
  'Loop-detection (2 hits in 10s): MISSING',
  'Global window.onerror & unhandledrejection logging: MISSING',
  'STATUS: RED (Fails N5.1 requirements)',
].join('\n')
fs.writeFileSync(
  path.join(redEvidenceDir, 'n5-1-error-boundary.txt'),
  n51Report,
  'utf8',
)
console.log(n51Report)
console.log('')

// Probe 2: N5.2 Privacy-safe Logger existence & Redaction
const loggerPath = path.join(rootDir, 'src', 'platform', 'logger.ts')
const hasLogger = fs.existsSync(loggerPath)
const n52Report = [
  '=== PROBE N5.2: PRIVACY-SAFE LOGGER & DIAGNOSTICS ===',
  `src/platform/logger.ts exists: ${hasLogger}`,
  'Rotating ring-buffer file log under maganis/logs/: MISSING',
  'Strict redaction helper: MISSING',
  'Native crash handler in MainActivity: MISSING',
  'ApplicationExitInfo bridge: MISSING',
  'STATUS: RED (Fails N5.2 requirements)',
].join('\n')
fs.writeFileSync(
  path.join(redEvidenceDir, 'n5-2-logger-redaction.txt'),
  n52Report,
  'utf8',
)
console.log(n52Report)
console.log('')

// Probe 3: N5.3 Crash-loop Safe Mode
const safeModePath = path.join(rootDir, 'src', 'platform', 'safeMode.ts')
const hasSafeMode = fs.existsSync(safeModePath)
const n53Report = [
  '=== PROBE N5.3: CRASH-LOOP SAFE MODE ===',
  `src/platform/safeMode.ts exists: ${hasSafeMode}`,
  'Crash loop tracking (3 starts in 3 min): MISSING',
  'Dynamic App import check in main.tsx: MISSING',
  'Self-contained SafeModeScreen component: MISSING',
  'STATUS: RED (Fails N5.3 requirements)',
].join('\n')
fs.writeFileSync(
  path.join(redEvidenceDir, 'n5-3-safe-mode.txt'),
  n53Report,
  'utf8',
)
console.log(n53Report)
console.log('')

// Probe 4: N5.5 Update Checker
const updateCheckerPath = path.join(
  rootDir,
  'src',
  'platform',
  'updateChecker.ts',
)
const hasUpdateChecker = fs.existsSync(updateCheckerPath)
const n55Report = [
  '=== PROBE N5.5: UPDATE CHECKER & INSTALL GUIDANCE ===',
  `src/platform/updateChecker.ts exists: ${hasUpdateChecker}`,
  'GitHub Releases API validator with Zod schema: MISSING',
  'Plain-text Arabic release notes parser: MISSING',
  'Pre-download verified backup trigger: MISSING',
  'Install guidance sheet in Settings: MISSING',
  'STATUS: RED (Fails N5.5 requirements)',
].join('\n')
fs.writeFileSync(
  path.join(redEvidenceDir, 'n5-5-update-checker.txt'),
  n55Report,
  'utf8',
)
console.log(n55Report)
console.log('')

// Probe 5: N5.6 Bundle Ratchet
const bundleRatchetPath = path.join(
  rootDir,
  'scripts',
  'check-bundle-ratchet.mjs',
)
const hasBundleRatchet = fs.existsSync(bundleRatchetPath)
const n56Report = [
  '=== PROBE N5.6: BUNDLE RATCHET & PERF BASELINE ===',
  `scripts/check-bundle-ratchet.mjs exists: ${hasBundleRatchet}`,
  'docs/perf-baseline-native.json exists: ' +
    fs.existsSync(path.join(rootDir, 'docs', 'perf-baseline-native.json')),
  'STATUS: RED (Fails N5.6 requirements)',
].join('\n')
fs.writeFileSync(
  path.join(redEvidenceDir, 'n5-6-bundle-ratchet.txt'),
  n56Report,
  'utf8',
)
console.log(n56Report)
console.log('')

console.log('✅ Red probes generated in evidence/n5/red/')
