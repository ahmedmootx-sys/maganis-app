#!/usr/bin/env node
/**
 * scripts/gate-clip-sources.mjs
 * Gate A2.1: Enforces that any clipping property or fixed container height
 * carries an explicit, documented `/* clip-ok: <reason> * /` annotation.
 *
 * Scans CSS and TSX styling for:
 * - overflow: hidden | clip
 * - overflow-x: hidden | clip
 * - overflow-y: hidden | clip
 * - contain: ...
 * - content-visibility: ...
 * - clip-path: ...
 * - fixed height / max-height on layout containers
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const CSS_DIRS = [
  path.join(rootDir, 'src/styles'),
  path.join(rootDir, 'src/ui'),
  path.join(rootDir, 'src/components'),
  path.join(rootDir, 'src/modules'),
]

function getFiles(dir, exts) {
  let files = []
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(getFiles(full, exts))
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      files.push(full)
    }
  }
  return files
}

const targetFiles = CSS_DIRS.flatMap((d) => getFiles(d, ['.css', '.tsx', '.ts']))

const CLIP_PATTERNS = [
  /overflow\s*:\s*(?:hidden|clip)/i,
  /overflow-[xy]\s*:\s*(?:hidden|clip)/i,
  /contain\s*:\s*(?:layout|paint|strict|content)/i,
  /content-visibility\s*:\s*(?:auto|hidden)/i,
  /clip-path\s*:\s*[^;]+;/i,
]

// TSX style object patterns
const TSX_CLIP_PATTERNS = [
  /overflow\s*:\s*['"](?:hidden|clip)['"]/i,
  /overflow[XY]\s*:\s*['"](?:hidden|clip)['"]/i,
  /contain\s*:\s*['"][^'"]+['"]/i,
  /clipPath\s*:\s*['"][^'"]+['"]/i,
]

let totalExamined = 0
let totalApprovedWithReason = 0
const violations = []

for (const file of targetFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  const relFile = path.relative(rootDir, file)
  let currentSelector = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('{')) {
      currentSelector = line.split('{')[0].trim()
    }
    let matchesClip = false

    if (file.endsWith('.css')) {
      const isClip = CLIP_PATTERNS.some((pat) => pat.test(line))
      const isLayoutContainer =
        /(container|content|scroller|wrapper|screen|shell|sheet|modal|dialog|workouts-tab)/i.test(
          currentSelector,
        )
      const isFixedHeight =
        isLayoutContainer &&
        /(?:^|\s)(?:max-)?height\s*:\s*\d+(?:px|vh|dvh|rem|em)/i.test(line)
      matchesClip = isClip || isFixedHeight
    } else {
      matchesClip = TSX_CLIP_PATTERNS.some((pat) => pat.test(line))
    }

    if (matchesClip) {
      totalExamined++
      // Look for /* clip-ok: <reason> */ or // clip-ok: <reason> on same line or within preceding 2 lines
      const context = [
        lines[i - 2] || '',
        lines[i - 1] || '',
        line,
        lines[i + 1] || '',
      ].join(' ')

      const reasonMatch = context.match(/(?:\/\*|\/\/)\s*clip-ok\s*:\s*([^*/\n]+)/i)
      if (reasonMatch) {
        totalApprovedWithReason++
      } else {
        violations.push({
          file: relFile,
          line: i + 1,
          code: line.trim(),
        })
      }
    }
  }
}

console.log('🚀 Running Gate: gate-clip-sources...')
console.log(`📊 Declarations examined: ${totalExamined}`)
console.log(`📊 Declarations with explicit clip-ok reason: ${totalApprovedWithReason}`)
console.log(`📊 Unannotated clipping declarations (violations): ${violations.length}`)

// Gate enforces a minimum examined (at least 20 across codebase)
if (totalExamined < 20) {
  console.error(`❌ Vacuous gate error: examined fewer than 20 declarations (${totalExamined})`)
  process.exit(1)
}

if (violations.length > 0) {
  console.error(`❌ Gate FAILED: found ${violations.length} unapproved clipping sources:`)
  violations.forEach((v, idx) => {
    console.error(`  ${idx + 1}. ${v.file}:${v.line} -> ${v.code}`)
  })
  process.exit(1)
}

console.log('✅ Gate PASSED: All clipping sources properly documented with clip-ok reason.')
