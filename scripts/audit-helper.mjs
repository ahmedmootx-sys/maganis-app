import fs from 'node:fs'
import path from 'node:path'

function walk(dir, exts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md']) {
  let files = []
  if (!fs.existsSync(dir)) return files
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.name === 'node_modules' || item.name === 'dist' || item.name === '.git' || item.name === '.cache') continue
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      files = files.concat(walk(full, exts))
    } else if (exts.some(e => item.name.endsWith(e))) {
      files.push(full)
    }
  }
  return files
}

const srcFiles = walk('src')
const dataFiles = walk('data')

const selectMatches = []
const dateMatches = []
const fileMatches = []
const alertMatches = []
const confirmMatches = []
const promptMatches = []

// Emoji regex: \p{Extended_Pictographic}
// Exclude allowed symbols: © (\u00A9), ® (\u00AE), ™ (\u2122)
const emojiRegex = /\p{Extended_Pictographic}/gu

const emojiInSrc = []
const emojiInData = []

for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  lines.forEach((l, idx) => {
    if (/<select\b/i.test(l)) selectMatches.push({ file, line: idx + 1, text: l.trim() })
    if (/type=['"]date['"]/i.test(l)) dateMatches.push({ file, line: idx + 1, text: l.trim() })
    if (/type=['"]file['"]/i.test(l)) fileMatches.push({ file, line: idx + 1, text: l.trim() })
    if (/\b(?:window\.)?alert\s*\(/i.test(l) && !l.includes('role="alert"')) alertMatches.push({ file, line: idx + 1, text: l.trim() })
    if (/\b(?:window\.)?confirm\s*\(/i.test(l)) confirmMatches.push({ file, line: idx + 1, text: l.trim() })
    if (/\b(?:window\.)?prompt\s*\(/i.test(l)) promptMatches.push({ file, line: idx + 1, text: l.trim() })

    const matches = l.match(emojiRegex)
    if (matches) {
      for (const m of matches) {
        if (m === '©' || m === '®' || m === '™') continue
        emojiInSrc.push({ file, line: idx + 1, char: m, text: l.trim() })
      }
    }
  })
}

for (const file of dataFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  lines.forEach((l, idx) => {
    const matches = l.match(emojiRegex)
    if (matches) {
      for (const m of matches) {
        if (m === '©' || m === '®' || m === '™') continue
        emojiInData.push({ file, line: idx + 1, char: m, text: l.trim() })
      }
    }
  })
}

// 2. CSS audit
const appCssPath = path.join('src', 'styles', 'app.css')
let cssColours = new Set()
let cssFontSizes = new Set()
let cssRadii = new Set()

if (fs.existsSync(appCssPath)) {
  const css = fs.readFileSync(appCssPath, 'utf8')
  // Match colors: hex (#fff, #123456), rgb(...), rgba(...)
  const hexMatches = css.match(/#(?:[0-9a-fA-F]{3,8})\b/g) || []
  const rgbMatches = css.match(/rgba?\([^)]+\)/g) || []
  for (const h of hexMatches) cssColours.add(h.toLowerCase())
  for (const r of rgbMatches) cssColours.add(r.toLowerCase())

  // Match font-size: \d+(?:\.\d+)?(?:px|rem|em|%)
  const fontMatches = css.match(/font-size:\s*([^;]+);/g) || []
  for (const f of fontMatches) {
    const val = f.replace(/font-size:\s*/, '').replace(';', '').trim()
    cssFontSizes.add(val)
  }

  // Match border-radius: \d+(?:\.\d+)?(?:px|rem|em|%)
  const radiusMatches = css.match(/border-radius:\s*([^;]+);/g) || []
  for (const r of radiusMatches) {
    const val = r.replace(/border-radius:\s*/, '').replace(';', '').trim()
    cssRadii.add(val)
  }
}

console.log('=== UI AUDIT RESULTS ===')
console.log(`Native <select> count: ${selectMatches.length}`)
selectMatches.forEach(m => console.log(`  [select] ${m.file}:${m.line} -> ${m.text}`))

console.log(`Date inputs (<input type="date">) count: ${dateMatches.length}`)
dateMatches.forEach(m => console.log(`  [date] ${m.file}:${m.line} -> ${m.text}`))

console.log(`File inputs (<input type="file">) count: ${fileMatches.length}`)
fileMatches.forEach(m => console.log(`  [file] ${m.file}:${m.line} -> ${m.text}`))

console.log(`window.alert count: ${alertMatches.length}`)
alertMatches.forEach(m => console.log(`  [alert] ${m.file}:${m.line} -> ${m.text}`))

console.log(`window.confirm count: ${confirmMatches.length}`)
confirmMatches.forEach(m => console.log(`  [confirm] ${m.file}:${m.line} -> ${m.text}`))

console.log(`window.prompt count: ${promptMatches.length}`)
promptMatches.forEach(m => console.log(`  [prompt] ${m.file}:${m.line} -> ${m.text}`))

console.log(`\nEmoji in src/: ${emojiInSrc.length}`)
const uniqueSrcEmoji = [...new Set(emojiInSrc.map(e => e.char))]
console.log(`Unique emoji in src/: ${uniqueSrcEmoji.join(' ')} (${uniqueSrcEmoji.length})`)

console.log(`Emoji in data/: ${emojiInData.length}`)
const uniqueDataEmoji = [...new Set(emojiInData.map(e => e.char))]
console.log(`Unique emoji in data/: ${uniqueDataEmoji.join(' ')} (${uniqueDataEmoji.length})`)

console.log(`\nCSS Audit (src/styles/app.css):`)
console.log(`Distinct colours: ${cssColours.size}`)
console.log(`Distinct font sizes: ${cssFontSizes.size}`)
console.log(`Distinct border radii: ${cssRadii.size}`)
