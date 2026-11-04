#!/usr/bin/env node
/**
 * scripts/gate-no-personal-data.mjs
 * Gate to prevent committing personal data, developer local paths, or private traces into the repository.
 *
 * Rules:
 * 1. Banned filename patterns (*profile-dump* or *backup*.json outside fixtures/ and qa/fixtures/).
 * 2. Any tracked JSON with medical.notes or limitations must only contain allowed synthetic values.
 * 3. No absolute local filesystem paths (e.g., C:/Users, /Users/, /home/).
 * 4. No personal email addresses (except noreply@ and example.).
 * 5. No phone number sequences (e.g. +20..., 010/011/012/015 Egyptian mobile numbers).
 * 6. No private user identifiers ("power tech", "power%20tech", "ahmedmo").
 * 7. Security Rule S1: Never commit keystores (*.jks, *.keystore), keystore.properties, passwords or tokens.
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
  console.log('=== GATE: NO PERSONAL DATA & PRIVACY CHECK (Task H4.7) ===\n')

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
  let rule1Count = 0
  let rule2Count = 0
  let rule3Count = 0
  let rule4Count = 0
  let rule5Count = 0
  let rule6Count = 0
  let rule7Count = 0

  const ABSOLUTE_PATH_REGEX =
    /(?:file:\/\/\/[a-zA-Z]:\/|[a-zA-Z]:\\Users\\|[a-zA-Z]:\/Users\/|\/Users\/|\/home\/)/i
  const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
  const PHONE_REGEX = /(?:\+20\s?1[0125]\d{8}\b|(?<!\d)01[0125]\d{8}\b)/g
  const FORBIDDEN_STRINGS = ['power tech', 'power%20tech', 'ahmedmo']

  for (const file of trackedFiles) {
    const filePath = path.join(rootDir, file)
    if (!fs.existsSync(filePath)) continue

    const lower = file.toLowerCase()
    const baseName = path.basename(lower)

    // Check Rule 1: Banned filename patterns
    rule1Count++
    if (!file.startsWith('fixtures/') && !file.startsWith('qa/fixtures/')) {
      if (
        baseName.includes('profile-dump') ||
        (baseName.includes('backup') && baseName.endsWith('.json'))
      ) {
        failures.push(
          `[Rule 1] Tracked file "${file}" violates rule: no *profile-dump* or *backup*.json outside fixtures/`,
        )
      }
    }

    // Check Rule 7 (Security S1): Keystores & sensitive keystore configurations
    rule7Count++
    if (
      baseName.endsWith('.jks') ||
      baseName.endsWith('.keystore') ||
      baseName === 'keystore.properties' ||
      baseName.endsWith('.p12')
    ) {
      failures.push(
        `[Rule 7] Banned keystore artifact tracked by git: "${file}". Keystores and keystore.properties must NEVER be committed (Security S1)!`,
      )
    }

    // Skip binary files for text scanning
    const isBinary = /\.(png|jpg|jpeg|gif|webp|bin|ico|wasm|zip|jar)$/i.test(
      file,
    )

    // Check Rule 2: JSON medical & limitations
    if (file.endsWith('.json')) {
      rule2Count++
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const data = JSON.parse(content)

        const checkProfile = (prof, source) => {
          if (!prof || typeof prof !== 'object') return
          if (
            prof.medical?.notes &&
            typeof prof.medical.notes === 'string' &&
            prof.medical.notes.trim()
          ) {
            if (
              !ALLOWED_SYNTHETIC_MEDICAL_NOTES.has(prof.medical.notes.trim())
            ) {
              failures.push(
                `[Rule 2] Tracked JSON "${file}" (${source}) has non-allowlisted medical.notes: "${prof.medical.notes.slice(0, 30)}..."`,
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
                    `[Rule 2] Tracked JSON "${file}" (${source}) has non-allowlisted limitations.notes: "${lim.notes.slice(0, 30)}..."`,
                  )
                }
              }
            }
          }
        }

        checkProfile(data.profile, 'data.profile')
        checkProfile(data, 'root')
      } catch {
        // Not a JSON object or parse error
      }
    }

    if (!isBinary) {
      let content = ''
      try {
        content = fs.readFileSync(filePath, 'utf8')
      } catch {
        continue
      }

      // Check Rule 3: Absolute local filesystem paths
      // Exclude the gate script itself from failing on its own regex pattern definition
      if (file !== 'scripts/gate-no-personal-data.mjs') {
        rule3Count++
        if (ABSOLUTE_PATH_REGEX.test(content)) {
          failures.push(
            `[Rule 3] Absolute path found in tracked file: "${file}"`,
          )
        }

        // Check Rule 4: Personal email addresses
        if (file !== 'package-lock.json') {
          rule4Count++
          const emails = content.match(EMAIL_REGEX) || []
          for (const email of emails) {
            const eLower = email.toLowerCase()
            if (
              !eLower.includes('noreply') &&
              !eLower.includes('example.com') &&
              !eLower.includes('domain.com') &&
              !eLower.includes('w3.org') &&
              !eLower.includes('youtube.com') &&
              !eLower.includes('vimeo.com')
            ) {
              failures.push(
                `[Rule 4] Disallowed email address found in "${file}": ${email}`,
              )
            }
          }
        }

        // Check Rule 5: Phone numbers
        rule5Count++
        const phones = content.match(PHONE_REGEX) || []
        if (phones.length > 0) {
          failures.push(
            `[Rule 5] Phone number sequence found in "${file}": ${phones.join(', ')}`,
          )
        }

        // Check Rule 6: Private user identifiers
        rule6Count++
        const contentLower = content.toLowerCase()
        for (const term of FORBIDDEN_STRINGS) {
          if (contentLower.includes(term)) {
            failures.push(
              `[Rule 6] Forbidden private identifier "${term}" found in "${file}"`,
            )
          }
        }

        // Check Rule 7 (Security S1): Private key headers, keystore configs or plaintext secrets
        if (
          file !== 'scripts/gate-no-personal-data.mjs' &&
          file !== 'scripts/android-keystore.mjs'
        ) {
          if (
            content.includes('BEGIN PRIVATE KEY') ||
            content.includes('BEGIN RSA PRIVATE KEY') ||
            content.includes('BEGIN ENCRYPTED PRIVATE KEY') ||
            content.includes('BEGIN EC PRIVATE KEY') ||
            content.includes('BEGIN OPENSSH PRIVATE KEY')
          ) {
            failures.push(
              `[Rule 7] Disallowed private key block found in "${file}" (Security S1)`,
            )
          }

          if (
            /ANDROID_KEYSTORE_PASSWORD\s*=\s*['"]?[a-zA-Z0-9_\-!@#$%^&*]{4,}['"]?/i.test(
              content,
            ) ||
            /ANDROID_KEY_PASSWORD\s*=\s*['"]?[a-zA-Z0-9_\-!@#$%^&*]{4,}['"]?/i.test(
              content,
            ) ||
            /ghp_[a-zA-Z0-9]{25,}/.test(content) ||
            /github_pat_[a-zA-Z0-9_]{25,}/.test(content)
          ) {
            failures.push(
              `[Rule 7] Disallowed plaintext secret/credential pattern found in "${file}" (Security S1)`,
            )
          }
        }
      }
    }
  }

  console.log(`[Rule 1] Files checked for banned name patterns: ${rule1Count}`)
  console.log(`[Rule 2] JSON files inspected for medical notes: ${rule2Count}`)
  console.log(`[Rule 3] Text files scanned for absolute paths: ${rule3Count}`)
  console.log(`[Rule 4] Text files scanned for email addresses: ${rule4Count}`)
  console.log(`[Rule 5] Text files scanned for phone numbers: ${rule5Count}`)
  console.log(`[Rule 6] Text files scanned for private terms: ${rule6Count}`)
  console.log(
    `[Rule 7] Files checked for keystore and credential leaks: ${rule7Count}`,
  )

  // Minimum checks enforcement (P4)
  if (rule1Count < 100 || rule3Count < 100) {
    console.error(`FAIL: Gate examined too few files (${rule1Count} < 100).`)
    process.exit(1)
  }

  if (failures.length > 0) {
    console.error(`\n❌ Gate failed with ${failures.length} violation(s):`)
    failures.forEach((f) => console.error(`  - ${f}`))
    process.exit(1)
  }

  console.log('\n✅ Gate passed: No personal data or absolute paths found.')
}

run()
