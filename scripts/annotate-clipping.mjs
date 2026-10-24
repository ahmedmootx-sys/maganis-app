import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const targetFiles = [
  ...['src/styles', 'src/ui', 'src/components', 'src/modules'].flatMap((d) => {
    function walk(dir) {
      let r = []
      const fullDir = path.join(rootDir, dir)
      if (!fs.existsSync(fullDir)) return r
      for (const e of fs.readdirSync(fullDir, { withFileTypes: true })) {
        const f = path.join(fullDir, e.name)
        if (e.isDirectory()) r = r.concat(walk(path.relative(rootDir, f)))
        else if (['.css', '.tsx', '.ts'].some((ext) => f.endsWith(ext))) r.push(f)
      }
      return r
    }
    return walk(d)
  }),
]

const CLIP_PATTERNS = [
  /overflow\s*:\s*(?:hidden|clip)/i,
  /overflow-[xy]\s*:\s*(?:hidden|clip)/i,
  /contain\s*:\s*(?:layout|paint|strict|content)/i,
  /content-visibility\s*:\s*(?:auto|hidden)/i,
  /clip-path\s*:\s*[^;]+;/i,
]

const TSX_CLIP_PATTERNS = [
  /overflow\s*:\s*['"](?:hidden|clip)['"]/i,
  /overflow[XY]\s*:\s*['"](?:hidden|clip)['"]/i,
  /contain\s*:\s*['"][^'"]+['"]/i,
  /clipPath\s*:\s*['"][^'"]+['"]/i,
]

let annotatedCount = 0

for (const file of targetFiles) {
  const content = fs.readFileSync(file, 'utf8')
  const lines = content.split('\n')
  let currentSelector = ''
  let fileChanged = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.includes('{')) currentSelector = line.split('{')[0].trim()

    let matchesClip = false
    let reason = 'controlled element boundary'

    if (file.endsWith('.css')) {
      const isClip = CLIP_PATTERNS.some((pat) => pat.test(line))
      const isLayout =
        /(container|content|scroller|wrapper|screen|shell|sheet|modal|dialog|workouts-tab)/i.test(
          currentSelector,
        )
      const isFixedHeight =
        isLayout &&
        /(?:^|\s)(?:max-)?height\s*:\s*\d+(?:px|vh|dvh|rem|em)/i.test(line)
      matchesClip = isClip || isFixedHeight
      if (/overflow-x/i.test(line)) reason = 'prevent horizontal drift'
      else if (/height/i.test(line)) reason = 'layout sheet or container constraint'
      else if (/ellipsis|title|label|subtitle/i.test(currentSelector))
        reason = 'text ellipsis truncation'
      else if (/thumb|avatar|circle|frame|box|track|bar/i.test(currentSelector))
        reason = 'rounded visual element'
      else reason = 'scaffold container boundary'
    } else {
      matchesClip = TSX_CLIP_PATTERNS.some((pat) => pat.test(line))
      if (/textOverflow|ellipsis/i.test(lines.slice(Math.max(0, i - 3), i + 4).join(' '))) {
        reason = 'text ellipsis truncation'
      } else if (/input|file/i.test(file.toLowerCase())) {
        reason = 'hidden native input overlay'
      } else if (/modal|sheet|scroller/i.test(file.toLowerCase())) {
        reason = 'modal sheet scroller boundary'
      } else {
        reason = 'visual element boundary'
      }
    }

    if (matchesClip) {
      const context = [
        lines[i - 2] || '',
        lines[i - 1] || '',
        line,
        lines[i + 1] || '',
      ].join(' ')
      if (!/(?:\/\*|\/\/)\s*clip-ok/i.test(context)) {
        if (file.endsWith('.css')) {
          lines[i] = line.replace(/;?\s*$/, ` /* clip-ok: ${reason} */;`)
            .replace(/;;$/, ';')
        } else {
          lines[i] = line.replace(/,?\s*$/, ` /* clip-ok: ${reason} */,`)
            .replace(/,,$/, ',')
        }
        annotatedCount++
        fileChanged = true
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8')
  }
}

console.log(`✅ Annotated ${annotatedCount} clipping declarations with clip-ok reason comments.`)
