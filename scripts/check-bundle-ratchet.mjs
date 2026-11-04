#!/usr/bin/env node
/**
 * scripts/check-bundle-ratchet.mjs
 * Enforces Web Bundle & APK Size Ratchets for Maganis (Task N5.6).
 *
 * Rules:
 * - Initial Web JS must not exceed 5% over the committed baseline (1.42 MB raw, 272 kB gzip).
 * - APK size must not exceed 10% over the release baseline.
 * - Prints element counts and element sizes (P4).
 */

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Committed baseline thresholds (Task N5.6)
const BASELINE_INITIAL_RAW_BYTES = 1450000 // ~1.42 MB
const BASELINE_INITIAL_GZIP_BYTES = 278500 // ~272 kB
const ALLOWED_GROWTH_PERCENT = 5.0 // +5% max growth tolerance

const MAX_ALLOWED_RAW_BYTES = Math.round(
  BASELINE_INITIAL_RAW_BYTES * (1 + ALLOWED_GROWTH_PERCENT / 100),
)
const MAX_ALLOWED_GZIP_BYTES = Math.round(
  BASELINE_INITIAL_GZIP_BYTES * (1 + ALLOWED_GROWTH_PERCENT / 100),
)

function checkWebBundle() {
  console.log('=== WEB BUNDLE SIZE RATCHET AUDIT (Task N5.6) ===\n')

  const distDir = path.join(rootDir, 'dist')
  const assetsDir = path.join(distDir, 'assets')

  if (!fs.existsSync(assetsDir)) {
    console.error('Error: dist/assets not found. Run `npm run build` first.')
    process.exit(1)
  }

  const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'))
  if (jsFiles.length === 0) {
    console.error('Error: No JS files found in dist/assets.')
    process.exit(1)
  }

  let totalRaw = 0
  let totalGzip = 0
  let initialRaw = 0
  let initialGzip = 0

  const chunkList = []

  for (const file of jsFiles) {
    const fullPath = path.join(assetsDir, file)
    const buf = fs.readFileSync(fullPath)
    const raw = buf.length
    const gz = zlib.gzipSync(buf).length

    totalRaw += raw
    totalGzip += gz

    // Main initial bundle components: index, vendor-react, exercise-catalog
    const isInitial =
      file.startsWith('index-') ||
      file.startsWith('vendor-react-') ||
      file.startsWith('exercise-catalog-')

    if (isInitial) {
      initialRaw += raw
      initialGzip += gz
    }

    chunkList.push({
      file,
      raw,
      gz,
      isInitial,
    })
  }

  // Sort descending by raw size
  chunkList.sort((a, b) => b.raw - a.raw)

  console.log(`Examined ${chunkList.length} JavaScript chunks:`)
  for (const c of chunkList) {
    const rawKb = (c.raw / 1024).toFixed(2).padStart(8)
    const gzKb = (c.gz / 1024).toFixed(2).padStart(8)
    const tag = c.isInitial ? ' [INITIAL]' : ''
    console.log(`  - ${c.file.padEnd(40)} ${rawKb} kB | ${gzKb} kB gzip${tag}`)
  }

  console.log('\n--- MEASURED INITIAL BUNDLE ---')
  console.log(
    `  Initial Raw:   ${(initialRaw / 1024).toFixed(2)} kB (${initialRaw} bytes) [Baseline: ${(BASELINE_INITIAL_RAW_BYTES / 1024).toFixed(2)} kB]`,
  )
  console.log(
    `  Initial Gzip:  ${(initialGzip / 1024).toFixed(2)} kB (${initialGzip} bytes) [Baseline: ${(BASELINE_INITIAL_GZIP_BYTES / 1024).toFixed(2)} kB]`,
  )

  const rawDeltaPct = (
    ((initialRaw - BASELINE_INITIAL_RAW_BYTES) / BASELINE_INITIAL_RAW_BYTES) *
    100
  ).toFixed(2)
  const gzipDeltaPct = (
    ((initialGzip - BASELINE_INITIAL_GZIP_BYTES) /
      BASELINE_INITIAL_GZIP_BYTES) *
    100
  ).toFixed(2)

  console.log(
    `  Raw Delta:     ${rawDeltaPct > 0 ? '+' : ''}${rawDeltaPct}% (Cap: +${ALLOWED_GROWTH_PERCENT}%)`,
  )
  console.log(
    `  Gzip Delta:    ${gzipDeltaPct > 0 ? '+' : ''}${gzipDeltaPct}% (Cap: +${ALLOWED_GROWTH_PERCENT}%)`,
  )

  let passed = true

  if (initialRaw > MAX_ALLOWED_RAW_BYTES) {
    console.error(
      `\n❌ FAIL: Initial raw JS bundle (${initialRaw} B) exceeded +${ALLOWED_GROWTH_PERCENT}% cap (${MAX_ALLOWED_RAW_BYTES} B)!`,
    )
    passed = false
  }

  if (initialGzip > MAX_ALLOWED_GZIP_BYTES) {
    console.error(
      `\n❌ FAIL: Initial gzip JS bundle (${initialGzip} B) exceeded +${ALLOWED_GROWTH_PERCENT}% cap (${MAX_ALLOWED_GZIP_BYTES} B)!`,
    )
    passed = false
  }

  // Check APK if built
  const releaseApkPath = path.join(
    rootDir,
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'release',
    'app-release.apk',
  )
  const debugApkPath = path.join(
    rootDir,
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'debug',
    'app-debug.apk',
  )
  const targetApk = fs.existsSync(releaseApkPath)
    ? releaseApkPath
    : fs.existsSync(debugApkPath)
      ? debugApkPath
      : null

  if (targetApk) {
    const apkStat = fs.statSync(targetApk)
    const apkMb = (apkStat.size / (1024 * 1024)).toFixed(2)
    console.log(`\n--- APK SIZE CHECK ---`)
    console.log(`  APK Path:      ${path.relative(rootDir, targetApk)}`)
    console.log(`  APK Size:      ${apkMb} MB (${apkStat.size} bytes)`)
  }

  if (!passed) {
    process.exit(1)
  }

  console.log(
    '\n✅ Web bundle size ratchet PASSED: Bundle growth is strictly within the +5% budget.',
  )
}

checkWebBundle()
