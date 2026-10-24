import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

// Load CLAIMS
const claimsFilePath = path.join(projectRoot, 'src', 'content', 'claims.ts')
const claimsModule = await import('../src/content/claims.ts')
const CLAIMS = claimsModule.CLAIMS

const inventory = []

for (const [id, claim] of Object.entries(CLAIMS)) {
  inventory.push({
    id: claim.id,
    file: 'src/content/claims.ts',
    text_ar: claim.text_ar,
    status: claim.status,
    source_id: claim.source_id || null,
    source_text: claim.source_text || null
  })
}

// Find all Arabic string literals >= 60 chars outside src/content
const TARGET_DIRS = [
  path.join(projectRoot, 'src', 'components'),
  path.join(projectRoot, 'src', 'modules'),
  path.join(projectRoot, 'src', 'ui'),
  path.join(projectRoot, 'src', 'shell'),
  path.join(projectRoot, 'src', 'App.tsx'),
]

const longStringsOutsideContent = []

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
    } else if (item.isFile() && /\.(tsx|ts)$/.test(item.name) && !item.name.includes('.test.')) {
      scanFile(full)
    }
  }
}

function scanFile(filePath) {
  const relPath = path.relative(projectRoot, filePath).replace(/\\/g, '/')
  const content = fs.readFileSync(filePath, 'utf8')

  // Quoted string literals
  const stringRegex = /(["'`])((?:\\.|[^\\])*?)\1/gs
  let match
  while ((match = stringRegex.exec(content)) !== null) {
    const str = match[2].trim()
    if (str.length >= 60 && /[\u0600-\u06FF]/.test(str)) {
      longStringsOutsideContent.push({
        file: relPath,
        text_ar: str
      })
    }
  }

  // JSX text nodes
  const jsxRegex = />([^<>{}]*[\u0600-\u06FF][^<>{}]*)</gs
  while ((match = jsxRegex.exec(content)) !== null) {
    const text = match[1].trim()
    if (text.length >= 60) {
      longStringsOutsideContent.push({
        file: relPath,
        text_ar: text
      })
    }
  }
}

for (const target of TARGET_DIRS) {
  scanDir(target)
}

const reportsDir = path.join(projectRoot, 'reports')
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })

const outPath = path.join(reportsDir, 'content-inventory.json')
fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2), 'utf8')

console.log('====================================================')
console.log('         CONTENT INVENTORY & R1 AUDIT               ')
console.log('====================================================')
console.log(`Registered Claims in inventory: ${inventory.length}`)
console.log(`Saved inventory to: ${outPath}`)
console.log(`\nLong Arabic strings (>= 60 chars) outside src/content: ${longStringsOutsideContent.length}`)

for (const s of longStringsOutsideContent.slice(0, 20)) {
  console.log(` - in ${s.file} (${s.text_ar.length} chars): "${s.text_ar.slice(0, 80)}..."`)
}
