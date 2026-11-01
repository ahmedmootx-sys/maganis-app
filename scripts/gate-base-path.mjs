import fs from 'node:fs'
import path from 'node:path'

const SRC_DIR = path.resolve('src')
const BANNED_STRING = '/maganis-app/'
const MIN_FILES = 50

function walk(dir) {
  let files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }
  return files
}

const allFiles = walk(SRC_DIR)
const filesToScan = allFiles.filter((f) => {
  const base = path.basename(f)
  // Exclude tests and config files
  if (base.includes('.test.') || base.includes('.spec.')) return false
  if (base.endsWith('.d.ts')) return false
  return true
})

console.log(`=== GATE: BASE PATH PURGE CHECK (Task N1.2) ===`)
console.log(
  `Total files in src scanned: ${filesToScan.length} (minimum required: ${MIN_FILES})`,
)

if (filesToScan.length < MIN_FILES) {
  console.error(
    `❌ Gate failed: scanned only ${filesToScan.length} files, expected >= ${MIN_FILES}`,
  )
  process.exit(1)
}

const violations = []

for (const file of filesToScan) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Check if line contains the banned string outside of comment-only if desired, or anywhere
    if (line.includes(BANNED_STRING)) {
      // Also ignore comment lines in assetUrl.ts if they are doc comments explaining web path, or allow no comments?
      // "fails if the string /maganis-app/ appears in src outside tests and config"
      // If assetUrl.ts has doc comments, let's see if we should purge comments or flag them.
      // Flagging all occurrences in src non-test non-config is the safest and cleanest.
      violations.push({
        file: path.relative(process.cwd(), file).replace(/\\/g, '/'),
        line: i + 1,
        content: line.trim(),
      })
    }
  }
}

if (violations.length > 0) {
  console.error(
    `❌ Gate failed: Found ${violations.length} occurrences of "${BANNED_STRING}" in src:`,
  )
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} -> ${v.content}`)
  }
  process.exit(1)
}

console.log(
  `✅ Gate passed: No hardcoded "${BANNED_STRING}" found in src/ (${filesToScan.length} files scanned).`,
)
process.exit(0)
