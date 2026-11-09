#!/usr/bin/env node
/**
 * scripts/gate-brand-name.mjs
 * Gate: Enforces correct brand spelling and app name consistency across locales (Task N6.5).
 *
 * Rules:
 * - Brand spelling must be «مجانص» (ending with sad, \u0645\u062c\u0627\u0646\u0635).
 * - The wrong spelling ending with seen (\u0645\u062c\u0627\u0646\u0633) is strictly forbidden
 *   in all tracked text files (excluding binaries, evidence/, package-lock.json).
 * - No res/values-xxx/strings.xml may override app_name or app_name_debug (app name must be
 *   the English "Maganis" / "Maganis (Debug)" in every locale).
 * - Prints number of files scanned and enforces minimum.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Build forbidden string from character codes so this script does not match itself
const FORBIDDEN_BRAND_NAME = String.fromCharCode(
  0x0645,
  0x062c,
  0x0627,
  0x0646,
  0x0633,
)

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.keystore',
  '.jks',
  '.jar',
  '.zip',
  '.tar',
  '.gz',
  '.mp4',
  '.webm',
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.bin',
  '.class',
])

function isBinary(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return BINARY_EXTENSIONS.has(ext)
}

function shouldSkip(filePath) {
  const normalized = filePath.replace(/\\/g, '/')
  if (normalized.startsWith('evidence/')) return true
  if (normalized === 'package-lock.json') return true
  if (isBinary(filePath)) return true
  return false
}

function getTrackedFiles() {
  try {
    const stdout = execSync('git ls-files', {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    })
    return stdout
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  } catch (err) {
    console.error('Failed to get tracked files from git:', err.message)
    process.exit(1)
  }
}

function checkAppNameOverrides() {
  const violations = []
  const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res')
  if (!fs.existsSync(resDir)) return violations

  const subdirs = fs.readdirSync(resDir, { withFileTypes: true })
  for (const dirent of subdirs) {
    if (dirent.isDirectory() && dirent.name.startsWith('values-')) {
      const stringsFile = path.join(resDir, dirent.name, 'strings.xml')
      if (fs.existsSync(stringsFile)) {
        const content = fs.readFileSync(stringsFile, 'utf8')
        if (/<string\s+name=["']app_name["']/i.test(content)) {
          violations.push(
            `${dirent.name}/strings.xml illegally overrides 'app_name' (must remain English across all locales)`,
          )
        }
        if (/<string\s+name=["']app_name_debug["']/i.test(content)) {
          violations.push(
            `${dirent.name}/strings.xml illegally overrides 'app_name_debug' (must remain English across all locales)`,
          )
        }
      }
    }
  }
  return violations
}

function main() {
  console.log('====================================================')
  console.log('         BRAND NAME & APP LABEL GATE (N6.5)         ')
  console.log('====================================================\n')

  const MIN_FILES = 200
  const tracked = getTrackedFiles()
  let scannedCount = 0
  const spellingViolations = []

  for (const relPath of tracked) {
    if (shouldSkip(relPath)) continue

    const fullPath = path.join(rootDir, relPath)
    if (!fs.existsSync(fullPath)) continue

    let content
    try {
      content = fs.readFileSync(fullPath, 'utf8')
    } catch {
      continue
    }

    scannedCount++

    if (content.includes(FORBIDDEN_BRAND_NAME)) {
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(FORBIDDEN_BRAND_NAME)) {
          spellingViolations.push({
            file: relPath,
            line: i + 1,
            snippet: lines[i].trim(),
          })
        }
      }
    }
  }

  const overrideViolations = checkAppNameOverrides()

  console.log(`Tracked files found: ${tracked.length}`)
  console.log(`Text files scanned:  ${scannedCount}`)
  console.log(`Enforcing minimum:   >= ${MIN_FILES} files\n`)

  if (scannedCount < MIN_FILES) {
    console.error(
      `❌ Gate FAILED: Scanned only ${scannedCount} files, expected at least ${MIN_FILES}.`,
    )
    process.exit(1)
  }

  let failed = false

  if (spellingViolations.length > 0) {
    failed = true
    console.error(
      `❌ Forbidden brand spelling violation detected in ${spellingViolations.length} place(s):`,
    )
    for (const v of spellingViolations) {
      console.error(`   - ${v.file}:${v.line}: ${v.snippet}`)
    }
  } else {
    console.log(
      '✅ Brand spelling verified: zero instances of forbidden spelling.',
    )
  }

  if (overrideViolations.length > 0) {
    failed = true
    console.error(`\n❌ App name locale override violations:`)
    for (const ov of overrideViolations) {
      console.error(`   - ${ov}`)
    }
  } else {
    console.log(
      '✅ App name override verified: no values-*/strings.xml overrides app_name.',
    )
  }

  if (failed) {
    console.error('\n❌ Gate FAILED: Brand name / label rules violated.')
    process.exit(1)
  }

  console.log('\n✅ Gate PASSED: All brand name and label checks green.')
}

main()
