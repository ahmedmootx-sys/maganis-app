import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const catalogPath = path.join(rootDir, 'src', 'data', 'catalog-v1.json')
const manifestPath = path.join(
  rootDir,
  'public',
  'media',
  'media-manifest.json',
)
const publicMediaDir = path.join(rootDir, 'public', 'media')

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

console.log('--- GATE MEDIA URLS ---')
console.log(
  `Checking media files for ${catalog.exercises.length} catalog exercises...`,
)

let checkedCount = 0
let errors = []

for (const ex of catalog.exercises) {
  const key = ex.key
  const exDir = path.join(publicMediaDir, key)

  if (ex.media?.gif?.display === true) {
    checkedCount++
    const gifFile = path.join(exDir, 'animation.gif')
    if (!fs.existsSync(gifFile)) {
      errors.push(`Missing GIF file for ${key}: ${gifFile}`)
    } else {
      const stat = fs.statSync(gifFile)
      if (stat.size === 0) {
        errors.push(`Empty GIF file for ${key}: ${gifFile}`)
      }
      // verify exact case on Windows
      const dirFiles = fs.readdirSync(exDir)
      if (!dirFiles.includes('animation.gif')) {
        errors.push(`Case mismatch for animation.gif in ${exDir}`)
      }
    }
  }

  if (ex.media?.frames?.display === true) {
    for (const f of ['start.jpg', 'peak.jpg']) {
      checkedCount++
      const frameFile = path.join(exDir, f)
      if (!fs.existsSync(frameFile)) {
        errors.push(`Missing frame file for ${key}: ${frameFile}`)
      } else {
        const stat = fs.statSync(frameFile)
        if (stat.size === 0) {
          errors.push(`Empty frame file for ${key}: ${frameFile}`)
        }
        const dirFiles = fs.readdirSync(exDir)
        if (!dirFiles.includes(f)) {
          errors.push(`Case mismatch for ${f} in ${exDir}`)
        }
      }
    }
  }
}

console.log(
  `Verified ${checkedCount} media assets across ${catalog.exercises.length} exercises.`,
)
console.log(
  `Manifest contains ${Object.keys(manifest.media || {}).length} hashed files.`,
)

if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} media verification errors:`)
  for (const err of errors) console.error('  - ' + err)
  process.exit(1)
}

console.log('PASSED: gate-media-urls OK.')
