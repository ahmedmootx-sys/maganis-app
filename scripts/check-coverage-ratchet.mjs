import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Ratchet baseline floors - thresholds can ONLY go up, never down.
const RATCHET_BASELINE = {
  lines: 37,
  statements: 37,
  functions: 35,
  branches: 55,
}

const viteConfigPath = path.join(rootDir, 'vite.config.ts')
const viteConfig = fs.readFileSync(viteConfigPath, 'utf8')

const linesMatch = viteConfig.match(/lines:\s*(\d+)/)
const statementsMatch = viteConfig.match(/statements:\s*(\d+)/)
const functionsMatch = viteConfig.match(/functions:\s*(\d+)/)
const branchesMatch = viteConfig.match(/branches:\s*(\d+)/)

if (!linesMatch || !statementsMatch || !functionsMatch || !branchesMatch) {
  console.error('❌ Could not parse coverage thresholds from vite.config.ts')
  process.exit(1)
}

const currentThresholds = {
  lines: Number(linesMatch[1]),
  statements: Number(statementsMatch[1]),
  functions: Number(functionsMatch[1]),
  branches: Number(branchesMatch[1]),
}

let failed = false
for (const [metric, baseline] of Object.entries(RATCHET_BASELINE)) {
  const current = currentThresholds[metric]
  if (current < baseline) {
    console.error(
      `❌ Coverage ratchet violation: ${metric} threshold (${current}%) is below ratchet baseline (${baseline}%)`,
    )
    failed = true
  } else {
    console.log(
      `✓ Coverage ratchet check: ${metric} ${current}% >= baseline ${baseline}%`,
    )
  }
}

if (failed) {
  process.exit(1)
}

console.log('✅ All coverage ratchet checks passed.')
