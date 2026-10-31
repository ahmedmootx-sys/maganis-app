import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Coverage Ratchet Check (Task H4.1)
 *
 * Enforces that measured test coverage from coverage/coverage-summary.json
 * does not regress below the committed baseline in coverage-baseline.json
 * (with a tight tolerance of -0.1%).
 *
 * HOW TO RAISE THE BASELINE:
 * 1. Run `npm run test:coverage` to execute the full test suite and refresh `coverage/coverage-summary.json`.
 * 2. Check the new percentages in `coverage/coverage-summary.json` (under `.total`).
 * 3. Update `coverage-baseline.json` with the new, higher values.
 * 4. Commit `coverage-baseline.json`. Baselines must only ratchet UP, never DOWN.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const summaryPath = path.join(rootDir, 'coverage', 'coverage-summary.json')
const baselinePath = path.join(rootDir, 'coverage-baseline.json')

if (!fs.existsSync(summaryPath)) {
  console.error(`❌ Coverage summary file not found: ${summaryPath}`)
  console.error(
    'Run `npm run test:coverage` before running the coverage ratchet.',
  )
  process.exit(1)
}

if (!fs.existsSync(baselinePath)) {
  console.error(`❌ Coverage baseline file not found: ${baselinePath}`)
  process.exit(1)
}

let summary
try {
  summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
} catch (e) {
  console.error(`❌ Failed to parse coverage summary JSON: ${e.message}`)
  process.exit(1)
}

let baseline
try {
  baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
} catch (e) {
  console.error(`❌ Failed to parse coverage baseline JSON: ${e.message}`)
  process.exit(1)
}

const total = summary.total
if (!total) {
  console.error(
    '❌ "total" coverage metrics missing from coverage-summary.json',
  )
  process.exit(1)
}

console.log('=== COVERAGE RATCHET CHECK (Task H4.1) ===')
console.log(`Baseline file: ${baselinePath}`)
console.log(`Summary file:  ${summaryPath}\n`)

const metrics = ['lines', 'statements', 'functions', 'branches']
let failed = false

for (const metric of metrics) {
  const measured = total[metric]?.pct
  const baseValue = baseline[metric]

  if (typeof measured !== 'number') {
    console.error(`❌ Missing measured metric "${metric}" in coverage summary`)
    failed = true
    continue
  }

  if (typeof baseValue !== 'number') {
    console.error(
      `❌ Missing baseline metric "${metric}" in coverage-baseline.json`,
    )
    failed = true
    continue
  }

  const floor = baseValue - 0.1

  if (measured < floor) {
    console.error(
      `❌ Coverage ratchet violation: ${metric} measured ${measured.toFixed(2)}% is below baseline floor ${floor.toFixed(2)}% (baseline: ${baseValue.toFixed(2)}%, tolerance: -0.1%)`,
    )
    failed = true
  } else {
    console.log(
      `✓ ${metric.padEnd(11)}: measured ${measured.toFixed(2)}% >= floor ${floor.toFixed(2)}% (baseline: ${baseValue.toFixed(2)}%)`,
    )
  }
}

console.log('')
if (failed) {
  console.error(
    '❌ Coverage ratchet check FAILED. Coverage has regressed below allowed floor.',
  )
  process.exit(1)
}

console.log('✅ All coverage ratchet checks PASSED.')
