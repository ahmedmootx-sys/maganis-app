#!/usr/bin/env node
/**
 * scripts/gate-units.mjs
 * Gate: Calorie & Measurement Unit Contract Verification (TASK G3 Part 3)
 *
 * Verifies:
 * 1. Zero occurrences of «كالوري» or «كالوِري» in user-facing UI source files.
 * 2. All calorie labels use «سعرة» / «سعرات» via single UNITS dictionary.
 * 3. Existence of centralized UNITS dictionary in src/utils/units.ts.
 * 4. Pluralization of «سعرة» adheres to strict Arabic rules in plural.ts.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const FORBIDDEN_WORDS = ['كالوري', 'كالوِري']

const SCAN_DIRS = [
  'src/modules/nutrition',
  'src/modules/dashboard',
  'src/modules/workout',
  'src/modules/onboarding',
  'src/modules/reports',
  'src/components',
  'src/ui',
  'src/App.tsx',
]

async function runGate() {
  console.log(
    '🚀 Running Gate: gate-units (Calorie & Measurement Unit Contract)...',
  )

  const failures = []
  let checksPassed = 0

  // 1. Scan for forbidden words in UI files
  for (const scanTarget of SCAN_DIRS) {
    const fullTarget = path.join(rootDir, scanTarget)
    if (!fs.existsSync(fullTarget)) continue

    const filesToScan = fs.statSync(fullTarget).isDirectory()
      ? fs
          .readdirSync(fullTarget, { recursive: true })
          .filter((f) => /\.(tsx?|jsx?)$/.test(f))
          .map((f) => path.join(fullTarget, f))
      : [fullTarget]

    for (const file of filesToScan) {
      const content = fs.readFileSync(file, 'utf8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // ignore comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*'))
          continue

        for (const word of FORBIDDEN_WORDS) {
          if (line.includes(word)) {
            const relFile = path.relative(rootDir, file)
            failures.push({
              test: 'FORBIDDEN_CALORIE_WORD',
              file: relFile,
              line: i + 1,
              matched: word,
              snippet: line.trim(),
            })
          }
        }
      }
    }
  }

  if (failures.length === 0) {
    checksPassed++
    console.log(
      '✓ Zero occurrences of «كالوري» or «كالوِري» in user-facing UI code',
    )
  } else {
    console.log(
      `❌ Found ${failures.length} forbidden calorie unit occurrences`,
    )
  }

  // 2. Check existence of centralized units dictionary
  const unitsPath = path.join(rootDir, 'src/utils/units.ts')
  if (fs.existsSync(unitsPath)) {
    const unitsContent = fs.readFileSync(unitsPath, 'utf8')
    if (unitsContent.includes('UNITS') && unitsContent.includes('سعرة')) {
      checksPassed++
      console.log('✓ Centralized UNITS dictionary exists in src/utils/units.ts')
    } else {
      failures.push({
        test: 'UNITS_DICT_INVALID',
        error:
          'src/utils/units.ts does not export UNITS dictionary with «سعرة»',
      })
    }
  } else {
    failures.push({
      test: 'UNITS_DICT_MISSING',
      error: 'src/utils/units.ts does not exist',
    })
  }

  // 3. Check pluralization support for «سعرة» in plural.ts
  const pluralPath = path.join(rootDir, 'src/utils/plural.ts')
  if (fs.existsSync(pluralPath)) {
    const pluralContent = fs.readFileSync(pluralPath, 'utf8')
    if (pluralContent.includes("'سعرة'") && pluralContent.includes("'سعرات'")) {
      checksPassed++
      console.log('✓ Arabic plural rules for «سعرة» defined in plural.ts')
    } else {
      failures.push({
        test: 'PLURAL_CALORIE_MISSING',
        error: 'plural.ts is missing plural definition for «سعرة»',
      })
    }
  }

  // Functional test of plural('سعرة')
  try {
    const { plural } = await import('../src/utils/plural.ts')
    if (
      plural(1, 'سعرة') === 'سعرة' &&
      plural(2, 'سعرة') === 'سعرتان' &&
      plural(5, 'سعرة') === '5 سعرات' &&
      plural(2000, 'سعرة') === '2000 سعرة'
    ) {
      checksPassed++
      console.log(
        '✓ Plural grammar verification passed (1 سعرة, 2 سعرتان, 5 سعرات, 2000 سعرة)',
      )
    } else {
      failures.push({
        test: 'PLURAL_CALORIE_GRAMMAR',
        error: `Plural grammar incorrect: 1->${plural(1, 'سعرة')}, 2->${plural(2, 'سعرة')}, 5->${plural(5, 'سعرة')}, 2000->${plural(2000, 'سعرة')}`,
      })
    }
  } catch (err) {
    failures.push({
      test: 'PLURAL_CALORIE_IMPORT',
      error: `Could not test plural: ${err.message}`,
    })
  }

  console.log(
    `\n📊 Gate Summary: ${checksPassed} checks passed, ${failures.length} failures`,
  )
  if (failures.length > 0) {
    console.error(
      `\n❌ FAIL: ${failures.length} unit contract violations detected:`,
    )
    for (const f of failures) {
      if (f.snippet) {
        console.error(
          `  [${f.test}] ${f.file}:${f.line} contains «${f.matched}»: ${f.snippet}`,
        )
      } else {
        console.error(`  [${f.test}] ${f.error}`)
      }
    }
    process.exit(1)
  }

  console.log(
    '\n✓ gate-units passed cleanly! All calorie units verified as «سعرة».',
  )
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
