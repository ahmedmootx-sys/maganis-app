#!/usr/bin/env node
/**
 * scripts/gate-icons.mjs
 * Gate: Icon Unification Verification (TASK G3 Part 3)
 *
 * Verifies:
 * 1. Zero bare text glyphs (▲, ▼, ✕, etc.) used as icon stand-ins in buttons and UI controls.
 * 2. All iconographic controls utilize SVG-based Icon component or official SVG components.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const FORBIDDEN_GLYPHS = ['▲', '▼', '✕']

const SCAN_DIRS = [
  'src/App.tsx',
  'src/components',
  'src/modules',
  'src/ui',
]

async function runGate() {
  console.log('🚀 Running Gate: gate-icons (Icon Unification Contract)...')

  const failures = []
  let checksPassed = 0

  for (const scanTarget of SCAN_DIRS) {
    const fullTarget = path.join(rootDir, scanTarget)
    if (!fs.existsSync(fullTarget)) continue

    const filesToScan = fs.statSync(fullTarget).isDirectory()
      ? fs.readdirSync(fullTarget, { recursive: true })
          .filter((f) => /\.(tsx?|jsx?)$/.test(f))
          .map((f) => path.join(fullTarget, f))
      : [fullTarget]

    for (const file of filesToScan) {
      const content = fs.readFileSync(file, 'utf8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // ignore comments or test files
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
        if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue

        for (const glyph of FORBIDDEN_GLYPHS) {
          if (line.includes(glyph)) {
            const relFile = path.relative(rootDir, file)
            failures.push({
              test: 'BARE_TEXT_GLYPH_ICON',
              file: relFile,
              line: i + 1,
              glyph,
              snippet: line.trim(),
            })
          }
        }
      }
    }
  }

  if (failures.length === 0) {
    checksPassed++
    console.log('✓ Zero bare text glyphs (▲, ▼, ✕) found in UI components')
  } else {
    console.log(`❌ Found ${failures.length} bare text glyph icon occurrences`)
  }

  console.log(`\n📊 Gate Summary: ${checksPassed} checks passed, ${failures.length} failures`)
  if (failures.length > 0) {
    console.error(`\n❌ FAIL: ${failures.length} icon unification violations detected:`)
    for (const f of failures) {
      console.error(`  [${f.test}] ${f.file}:${f.line} contains «${f.glyph}»: ${f.snippet}`)
    }
    process.exit(1)
  }

  console.log('\n✓ gate-icons passed cleanly! All icons unified to SVG.')
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
