import fs from 'node:fs'
import path from 'node:path'

function walk(dir, exts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css']) {
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

const emojiRegex = /\p{Extended_Pictographic}/gu

const targetDirs = ['src', 'data']
const violations = []

for (const d of targetDirs) {
  const files = walk(d)
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8')
    const lines = content.split('\n')
    lines.forEach((line, idx) => {
      const matches = line.match(emojiRegex)
      if (matches) {
        for (const m of matches) {
          if (m === '©' || m === '®' || m === '™') continue
          violations.push({
            file: f,
            line: idx + 1,
            char: m,
            text: line.trim()
          })
        }
      }
    })
  }
}

if (violations.length > 0) {
  console.error(`❌ Check-Emoji Failed: Found ${violations.length} forbidden emoji in src/ and data/:`)
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.char}] -> ${v.text.slice(0, 80)}`)
  }
  process.exit(1)
} else {
  console.log('✓ Check-Emoji Passed: 0 forbidden emojis found in src/ and data/.')
  process.exit(0)
}
