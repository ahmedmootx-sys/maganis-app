import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

// Banned regex patterns
const BANNED_PATTERNS = [
  { name: 'Day letter (يوم A-E)', regex: /يوم\s+[A-Ea-e]\b/ },
  { name: 'Day letter en (Day A-E)', regex: /\bDay\s+[A-Ea-e]\b/i },
  {
    name: 'Ordinal program day (اليوم الأول-الخامس)',
    regex: /اليوم\s+(الأول|الثاني|الثالث|الرابع|الخامس)/,
  },
  { name: 'Formal muscle name: الدالية', regex: /الدالية/ },
  { name: 'Formal muscle name: الرباعية', regex: /الرباعية/ },
  { name: 'Formal muscle name: اللاتيسيموس', regex: /اللاتيسيموس/ },
  { name: 'Formal muscle name: المسنّنة', regex: /المسنّنة/ },
  { name: 'Formal muscle name: الصدرية الكبرى', regex: /الصدرية\s+الكبرى/ },
  {
    name: 'Formal muscle name: المستقيمة الفخذية',
    regex: /المستقيمة\s+الفخذية/,
  },
]

// Allowlist for search aliases inside gym_ar_alt or input mapping normalizers
const ALLOWED_FILES = [
  'src/data/muscle-names.json', // gym_ar_alt allows search by formal names
  'public/atlas/atlas-meta.json', // anatomical source reference metadata
  'src/modules/workout/muscleHelper.ts', // legacy mapper for formal terms to gym terms
  'src/modules/workout/muscleResolver.ts', // input normalizer map for external search inputs
  'tools/atlas/check_names.mjs',
  'scripts/gate-banned-patterns.mjs',
]

const TARGET_DIRS = [
  path.join(projectRoot, 'src', 'data', 'catalog-v1.json'),
  path.join(projectRoot, 'src', 'content'),
  path.join(projectRoot, 'src', 'components'),
  path.join(projectRoot, 'src', 'modules'),
  path.join(projectRoot, 'src', 'ui'),
  path.join(projectRoot, 'src', 'shell'),
  path.join(projectRoot, 'src', 'App.tsx'),
]

let totalStringsExamined = 0
const violations = []

function scanFile(filePath) {
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/')
  if (ALLOWED_FILES.includes(relPath) || relPath.includes('.test.')) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  const ext = path.extname(filePath)

  if (ext === '.json') {
    // For json catalogs and data, parse and scan string values recursively
    try {
      const data = JSON.parse(content)
      scanObject(data, relPath)
    } catch {
      scanStringLiterals(content, relPath)
    }
  } else {
    scanStringLiterals(content, relPath)
  }
}

function scanObject(obj, relPath) {
  if (typeof obj === 'string') {
    totalStringsExamined++
    checkString(obj, relPath)
  } else if (Array.isArray(obj)) {
    for (const item of obj) scanObject(item, relPath)
  } else if (obj && typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      if (key === 'gym_ar_alt') continue // allow search aliases
      scanObject(val, relPath)
    }
  }
}

function scanStringLiterals(code, relPath) {
  // Matches string literals
  const regex = /(["'`])((?:\\.|[^\\])*?)\1/g
  let match
  while ((match = regex.exec(code)) !== null) {
    const str = match[2]
    if (/[\u0600-\u06FF]/.test(str)) {
      totalStringsExamined++
      checkString(str, relPath)
    }
  }
}

function checkString(str, relPath) {
  for (const { name, regex } of BANNED_PATTERNS) {
    if (regex.test(str)) {
      violations.push({
        file: relPath,
        pattern: name,
        match: str.length > 90 ? str.slice(0, 90) + '...' : str,
      })
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

for (const d of TARGET_DIRS) {
  scanDir(d)
}

console.log('====================================================')
console.log('            GATE: BANNED PATTERNS AUDIT            ')
console.log('====================================================')
console.log(`Total Arabic UI/Catalog strings examined: ${totalStringsExamined}`)
console.log(`Banned pattern violations found: ${violations.length}`)

if (violations.length > 0) {
  console.log('\nViolations detail:')
  for (const v of violations.slice(0, 30)) {
    console.log(` - [${v.pattern}] in ${v.file}: "${v.match}"`)
  }
  if (violations.length > 30) {
    console.log(` ... and ${violations.length - 30} more.`)
  }
  console.log('====================================================')
  process.exit(1)
} else {
  console.log('✓ All strings free of banned patterns!')
  console.log('====================================================')
  process.exit(0)
}
