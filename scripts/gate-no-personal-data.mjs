#!/usr/bin/env node
/**
 * scripts/gate-no-personal-data.mjs
 * Gate to prevent committing personal data or real medical profiles into the repository.
 *
 * Rules:
 * 1. No tracked files matching *profile-dump* or *backup*.json outside fixtures/.
 * 2. Any tracked JSON with medical.notes or limitations must only contain allowed synthetic values.
 * 3. Enforces counts and minimums (P4).
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Synthetic allow-list for medical notes and limitations in tracked JSONs
const ALLOWED_SYNTHETIC_MEDICAL_NOTES = new Set([
  '',
  'ملاحظة تجريبية عامة',
  'لا توجد إصابات نشطة',
])

const ALLOWED_SYNTHETIC_LIMITATION_NOTES = new Set([
  '',
  'ملاحظة تجريبية لتحديد النطاق',
])

function run() {
  console.log('=== GATE: NO PERSONAL DATA (Task H3-A A2) ===\n')

  let trackedFiles = []
  try {
    const stdout = execSync('git ls-files', { cwd: rootDir, encoding: 'utf8' })
    trackedFiles = stdout
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
  } catch (err) {
    console.error('Failed to list git tracked files:', err)
    process.exit(1)
  }

  const failures = []
  let filesExamined = 0
  let jsonFilesExamined = 0

  for (const file of trackedFiles) {
    filesExamined++
    const lower = file.toLowerCase()
    const baseName = path.basename(lower)

    // Check Rule 1: Banned filename patterns outside fixtures/
    if (!file.startsWith('fixtures/')) {
      if (
        baseName.includes('profile-dump') ||
        (baseName.includes('backup') && baseName.endsWith('.json'))
      ) {
        failures.push(
          `Tracked file "${file}" violates rule: no *profile-dump* or *backup*.json outside fixtures/`,
        )
      }
    }

    // Check Rule 2: JSON inspection for medical notes and limitations
    if (file.endsWith('.json') && fs.existsSync(path.join(rootDir, file))) {
      jsonFilesExamined++
      try {
        const content = fs.readFileSync(path.join(rootDir, file), 'utf8')
        const data = JSON.parse(content)

        // Check top-level or nested profile medical
        const checkProfile = (prof, source) => {
          if (!prof) return
          if (
            prof.medical?.notes &&
            typeof prof.medical.notes === 'string' &&
            prof.medical.notes.trim()
          ) {
            if (
              !ALLOWED_SYNTHETIC_MEDICAL_NOTES.has(prof.medical.notes.trim())
            ) {
              failures.push(
                `Tracked JSON "${file}" (${source}) has real/non-allowlisted medical.notes: "${prof.medical.notes.slice(0, 30)}..."`,
              )
            }
          }
          if (Array.isArray(prof.limitations)) {
            for (const lim of prof.limitations) {
              if (
                lim.notes &&
                typeof lim.notes === 'string' &&
                lim.notes.trim()
              ) {
                if (!ALLOWED_SYNTHETIC_LIMITATION_NOTES.has(lim.notes.trim())) {
                  failures.push(
                    `Tracked JSON "${file}" (${source}) has real/non-allowlisted limitations.notes: "${lim.notes.slice(0, 30)}..."`,
                  )
                }
              }
            }
          }
        }

        checkProfile(data.profile, 'data.profile')
        checkProfile(data, 'root')
      } catch {
        // Not all json are objects or parseable, skip
      }
    }
  }

  console.log(`Tracked files examined: ${filesExamined}`)
  console.log(`JSON files scanned for personal data: ${jsonFilesExamined}`)

  // Minimum checks enforcement (P4)
  if (filesExamined < 100) {
    console.error(`FAIL: Gate examined too few files (${filesExamined} < 100).`)
    process.exit(1)
  }
  if (jsonFilesExamined < 5) {
    console.error(
      `FAIL: Gate examined too few JSON files (${jsonFilesExamined} < 5).`,
    )
    process.exit(1)
  }

  if (failures.length > 0) {
    console.error(`\n❌ Gate failed with ${failures.length} violation(s):`)
    failures.forEach((f) => console.error(`  - ${f}`))
    process.exit(1)
  }

  console.log('\n✅ Gate passed: No personal data found in tracked files.')
}

run()
