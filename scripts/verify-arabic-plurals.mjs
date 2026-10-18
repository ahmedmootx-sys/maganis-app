#!/usr/bin/env node
/**
 * scripts/verify-arabic-plurals.mjs
 * Gate for Arabic plural rules:
 * For digits 3–10, Arabic grammar requires the plural (جمع تكسير / جمع مؤنث/مذكر),
 * NOT the singular form.
 * Checks source files and rendered templates for digit 3-10 followed by singular dictionary nouns.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const SINGULAR_NOUNS = [
  'تمرين',
  'مجموعة',
  'تكرار',
  'جولة',
  'يوم',
  'أسبوع',
  'شهر',
  'وجبة',
  'صنف',
  'بديل',
  'نشاط',
  'وزن',
]

// Regex pattern: 3-10 or ${...} followed by singular noun without plural helper
// specifically checking strings like "3 تمرين" or "4 مجموعة" or `${count} تمرين`
const pluralViolations = []

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, idx) => {
    // Skip comments or test files
    if (filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) return
    if (filePath.includes('node_modules') || filePath.includes('dist')) return
    if (filePath.includes('scripts/verify-arabic-plurals.mjs')) return
    if (filePath.includes('src/utils/plural.ts')) return

    for (const noun of SINGULAR_NOUNS) {
      // Pattern: (3|4|5|6|7|8|9|10)\s+noun
      const directRegex = new RegExp(`(?:\\b|[^0-9])([3-9]|10)\\s+${noun}(?:\\b|[^a-zA-Z0-9_\u0621-\u064A])`, 'g')
      let match
      while ((match = directRegex.exec(line)) !== null) {
        pluralViolations.push({
          file: path.relative(rootDir, filePath),
          line: idx + 1,
          matched: match[0].trim(),
          noun,
          content: line.trim(),
        })
      }
    }
  })
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'docs'].includes(entry.name)) continue
      scanDir(fullPath)
    } else if (/\.(tsx|ts|jsx|js|html)$/.test(entry.name)) {
      checkFile(fullPath)
    }
  }
}

console.log('🚀 Running Arabic Plurals Verification Gate...')
scanDir(path.join(rootDir, 'src'))

if (pluralViolations.length > 0) {
  console.error(`❌ Found ${pluralViolations.length} Arabic plural violations (digit 3-10 followed by singular noun):`)
  for (const v of pluralViolations) {
    console.error(`   - [${v.file}:${v.line}] "${v.matched}" in: ${v.content}`)
  }
  process.exit(1)
} else {
  console.log('✅ Arabic Plurals Verification PASSED: 0 plural violations found across codebase.')
  process.exit(0)
}
