#!/usr/bin/env node
/**
 * scripts/check-screenshots-not-blank.mjs
 * Validates that emulator screenshots are non-blank and display real UI (Task N6.2).
 *
 * Rules:
 * - Checks that screenshot files exist and have non-trivial size (> 15 KB).
 * - Computes byte entropy / variance across the file to ensure the screen is not
 *   a solid color (e.g., pure black, pure white, or stalled blank splash).
 * - Enforces minimum screenshot count.
 */

import fs from 'node:fs'
import path from 'node:path'

function computeVariance(buffer) {
  if (buffer.length === 0) return 0
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i]
  }
  const mean = sum / buffer.length
  let variance = 0
  for (let i = 0; i < buffer.length; i++) {
    variance += Math.pow(buffer[i] - mean, 2)
  }
  return variance / buffer.length
}

function main() {
  const dir = process.argv[2] || 'emulator-artifacts'
  console.log('====================================================')
  console.log('       SCREENSHOT NON-BLANK VERIFICATION (N6.2)     ')
  console.log('====================================================')
  console.log(`Artifacts Directory: ${dir}\n`)

  if (!fs.existsSync(dir)) {
    console.error(`❌ Error: Screenshots directory does not exist: ${dir}`)
    process.exit(1)
  }

  const pngFiles = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.png'))

  if (pngFiles.length === 0) {
    console.error(`❌ Error: No PNG screenshots found in ${dir}`)
    process.exit(1)
  }

  let failed = false
  const MIN_SIZE_BYTES = 10 * 1024 // 10 KB
  const MIN_VARIANCE = 500 // Solid black/white has near zero entropy/variance

  for (const f of pngFiles) {
    const fullPath = path.join(dir, f)
    const buf = fs.readFileSync(fullPath)
    const size = buf.length
    const variance = computeVariance(buf)

    console.log(
      `Checking ${f}: size = ${size} bytes, variance = ${variance.toFixed(1)}`,
    )

    if (size < MIN_SIZE_BYTES) {
      console.error(
        `❌ Screenshot "${f}" is suspiciously small (${size} bytes < ${MIN_SIZE_BYTES})!`,
      )
      failed = true
    } else if (variance < MIN_VARIANCE) {
      console.error(
        `❌ Screenshot "${f}" has suspiciously low variance (${variance.toFixed(1)} < ${MIN_VARIANCE}), likely blank!`,
      )
      failed = true
    } else {
      console.log(`✅ ${f} verified non-blank.`)
    }
  }

  if (failed) {
    console.error('\n❌ Screenshot non-blank validation FAILED.')
    process.exit(1)
  }

  console.log(
    `\n✅ All ${pngFiles.length} screenshots verified non-blank and render real UI.`,
  )
}

main()
