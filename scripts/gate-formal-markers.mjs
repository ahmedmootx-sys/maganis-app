import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

function makeArabicWordRegex(word) {
  // Matches Arabic word boundaries using Unicode letter/number character classes
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${word}(?:[^\\p{L}\\p{N}]|$)`, 'u')
}

const FORMAL_MARKERS = [
  { marker: 'ينبغي', regex: makeArabicWordRegex('ينبغي') },
  { marker: 'يتوجب', regex: makeArabicWordRegex('يتوجب') },
  { marker: 'يجب أن', regex: /(?:^|[^\p{L}\p{N}])يجب\s+أن(?:[^\p{L}\p{N}]|$)/u },
  { marker: 'قم بـ', regex: /(?:^|[^\p{L}\p{N}])قم\s+ب/u },
  { marker: 'حيث إن', regex: /(?:^|[^\p{L}\p{N}])حيث\s+(إن|ان)(?:[^\p{L}\p{N}]|$)/u },
  { marker: 'وذلك', regex: makeArabicWordRegex('وذلك') },
  { marker: 'لكي', regex: makeArabicWordRegex('لكي') },
  { marker: 'سوف', regex: makeArabicWordRegex('سوف') },
  { marker: 'بإمكانك', regex: makeArabicWordRegex('ب[إا]مكانك') },
  { marker: 'يمكنك', regex: makeArabicWordRegex('يمكنك') },
  { marker: 'الرجاء', regex: makeArabicWordRegex('الرجاء') },
  { marker: 'من فضلك', regex: /(?:^|[^\p{L}\p{N}])من\s+فضلك(?:[^\p{L}\p{N}]|$)/u },
]


// Allowlist file
const allowlistPath = path.join(projectRoot, 'scripts', 'formal-markers-allowlist.json')
let allowlist = []
if (fs.existsSync(allowlistPath)) {
  try {
    allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'))
  } catch (err) {
    console.error('Error reading allowlist:', err)
  }
}

const TARGET_DIRS = [
  path.join(projectRoot, 'src', 'data', 'catalog-v1.json'),
  path.join(projectRoot, 'src', 'components'),
  path.join(projectRoot, 'src', 'modules'),
  path.join(projectRoot, 'src', 'ui'),
  path.join(projectRoot, 'src', 'shell'),
  path.join(projectRoot, 'src', 'App.tsx'),
]

let totalStringsExamined = 0
const violations = []

function isAllowed(str, file, marker) {
  return allowlist.some(item => {
    if (item.marker && item.marker !== marker) return false
    if (item.file && !file.includes(item.file)) return false
    if (item.pattern && str.includes(item.pattern)) return true
    if (item.exact && str === item.exact) return true
    return false
  })
}

function scanFile(filePath) {
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/')
  if (relPath.includes('.test.') || relPath.includes('node_modules')) return

  const content = fs.readFileSync(filePath, 'utf8')
  const ext = path.extname(filePath)

  if (ext === '.json') {
    try {
      const data = JSON.parse(content)
      scanObject(data, relPath)
    } catch {
      scanText(content, relPath)
    }
  } else {
    scanText(content, relPath)
  }
}

function scanObject(obj, relPath) {
  if (typeof obj === 'string') {
    totalStringsExamined++
    checkString(obj, relPath)
  } else if (Array.isArray(obj)) {
    for (const item of obj) scanObject(item, relPath)
  } else if (obj && typeof obj === 'object') {
    for (const val of Object.values(obj)) {
      scanObject(val, relPath)
    }
  }
}

function scanText(code, relPath) {
  // 1. Quoted string literals (including multiline with s flag)
  const stringRegex = /(["'`])((?:\\.|[^\\])*?)\1/gs
  let match
  while ((match = stringRegex.exec(code)) !== null) {
    const str = match[2]
    if (/[\u0600-\u06FF]/.test(str)) {
      totalStringsExamined++
      checkString(str, relPath)
    }
  }

  // 2. JSX text between tags: > Arabic text <
  const jsxRegex = />([^<>{}]*[\u0600-\u06FF][^<>{}]*)</gs
  while ((match = jsxRegex.exec(code)) !== null) {
    const text = match[1].trim()
    if (text.length > 0) {
      totalStringsExamined++
      checkString(text, relPath)
    }
  }
}


function checkString(str, relPath) {
  for (const { marker, regex } of FORMAL_MARKERS) {
    if (regex.test(str)) {
      if (!isAllowed(str, relPath, marker)) {
        violations.push({
          file: relPath,
          marker,
          snippet: str.length > 90 ? str.slice(0, 90) + '...' : str
        })
      }
    }
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return
  const stat = fs.statSync(dir)
  if (stat.isFile()) {
    scanFile(dir)
    return
  }
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      scanDir(full)
    } else if (item.isFile() && /\.(tsx|ts|json)$/.test(item.name)) {
      scanFile(full)
    }
  }
}

for (const target of TARGET_DIRS) {
  scanDir(target)
}

console.log('====================================================')
console.log('            GATE: FORMAL MARKERS AUDIT             ')
console.log('====================================================')
console.log(`Total Arabic UI/Catalog strings examined: ${totalStringsExamined}`)
console.log(`Allowlist entries loaded: ${allowlist.length}`)
console.log(`Formal marker violations found: ${violations.length}`)

if (violations.length > 0) {
  console.log('\nViolations detail:')
  for (const v of violations.slice(0, 30)) {
    console.log(` - [${v.marker}] in ${v.file}: "${v.snippet}"`)
  }
  if (violations.length > 30) {
    console.log(` ... and ${violations.length - 30} more.`)
  }
  console.log('====================================================')
  process.exit(1)
} else {
  console.log('✓ All examined strings are free of banned formal markers!')
  console.log('====================================================')
  process.exit(0)
}
