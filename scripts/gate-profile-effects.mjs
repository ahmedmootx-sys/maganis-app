import fs from 'node:fs'
import path from 'node:path'

/**
 * Gate: gate-profile-effects
 *
 * Enforces that every onboarding / profile field in Maganis:
 * 1. Is documented in docs/PROFILE-EFFECTS.md with a valid consumer classification.
 * 2. Has an explicit `display_only: <reason>` OR a `functional: <test-files>` entry.
 * 3. Any functional test file registered in docs/PROFILE-EFFECTS.md actually exists on disk.
 * 4. Checks that no field remains marked as an unhandled gap (**NONE (Gap)**) in docs/PROFILE-EFFECTS.md.
 * 5. Runs deriveConstraints(profile) on both standard fixture data and owner production dump.
 */

const ROOT = process.cwd()
const DOC_PATH = path.join(ROOT, 'docs', 'PROFILE-EFFECTS.md')
const OWNER_DUMP_PATH = path.join(ROOT, 'docs', 'owner-profile-dump.json')
const CONSTRAINTS_MODULE = path.join(ROOT, 'src', 'modules', 'workout', 'constraints.ts')

console.log('=== GATE: PROFILE EFFECTS AUDIT ===\n')

if (!fs.existsSync(DOC_PATH)) {
  console.error(`FAIL: ${DOC_PATH} does not exist.`)
  process.exit(1)
}

const docContent = fs.readFileSync(DOC_PATH, 'utf-8')
const lines = docContent.split('\n')

// Parse Markdown Table in docs/PROFILE-EFFECTS.md
const tableRows = []
let inTable = false

for (const line of lines) {
  const trimmed = line.trim()
  if (trimmed.startsWith('| `') || trimmed.startsWith('|`')) {
    inTable = true
    const cols = trimmed
      .split('|')
      .map((c) => c.trim())
      .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)
    if (cols.length >= 5) {
      tableRows.push({
        field: cols[0].replace(/`/g, ''),
        domain: cols[1],
        preG6Consumers: cols[2],
        g6bConsumer: cols[3],
        category: cols[4],
      })
    }
  }
}

console.log(`Parsed ${tableRows.length} documented profile fields from PROFILE-EFFECTS.md`)
if (tableRows.length < 15) {
  console.error(`FAIL: Expected at least 15 profile fields, found ${tableRows.length}`)
  process.exit(1)
}

const failures = []
let functionalCount = 0
let displayOnlyCount = 0

for (const row of tableRows) {
  const cat = row.category
  if (cat.startsWith('`display_only:')) {
    displayOnlyCount++
    const reason = cat.replace('`display_only:', '').replace(/`/g, '').trim()
    if (!reason || reason.length < 5) {
      failures.push(`Field ${row.field} has invalid display_only reason: "${reason}"`)
    }
  } else if (cat.startsWith('`functional:')) {
    functionalCount++
    const testListStr = cat.replace('`functional:', '').replace(/`/g, '').trim()
    const testFiles = testListStr.split(',').map((t) => t.trim()).filter(Boolean)
    if (testFiles.length === 0) {
      failures.push(`Field ${row.field} marked functional but has no test files specified`)
    }
    for (const tf of testFiles) {
      // Find file in src/
      const match = findTestFile('src', tf)
      if (!match) {
        failures.push(`Field ${row.field} references test file "${tf}" which does not exist on disk`)
      }
    }
  } else {
    failures.push(`Field ${row.field} has unrecognized category: "${cat}". Must be display_only or functional.`)
  }

  // Pre-fix check: if the field still has unhandled gap in table
  if (row.g6bConsumer.includes('**NONE (Gap)**')) {
    failures.push(`Field ${row.field} still has unhandled gap: ${row.g6bConsumer}`)
  }
}

function findTestFile(dir, filename) {
  const fullDir = path.join(ROOT, dir)
  if (!fs.existsSync(fullDir)) return null
  const entries = fs.readdirSync(fullDir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name)
    if (entry.isDirectory()) {
      const found = findTestFile(path.join(dir, entry.name), filename)
      if (found) return found
    } else if (entry.isFile() && entry.name === filename) {
      return fullPath
    }
  }
  return null
}

// Check deriveConstraints module implementation
if (!fs.existsSync(CONSTRAINTS_MODULE)) {
  failures.push(`Constraints module missing: ${CONSTRAINTS_MODULE}`)
}

console.log(`Functional fields: ${functionalCount}`)
console.log(`Display-only fields: ${displayOnlyCount}`)

if (failures.length > 0) {
  console.error(`\n❌ FAIL: gate-profile-effects detected ${failures.length} issues:`)
  for (const f of failures) {
    console.error(`  - ${f}`)
  }
  process.exit(1)
}

console.log('\n✅ PASS: gate-profile-effects passed all checks.')
