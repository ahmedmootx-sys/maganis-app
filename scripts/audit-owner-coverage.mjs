import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const mappingCsv = fs.readFileSync(path.join(rootDir, 'docs/program-import-mapping.csv'), 'utf8')
const lines = mappingCsv.split(/\r?\n/).filter(Boolean).slice(1)
const diskFiles = new Set(fs.readdirSync(path.join(rootDir, 'public/exercises')))

console.log('Auditing Owner 41 Exercises Coverage:')
let mapped = 0
let twoFrames = 0
let oneFrame = 0
let zeroFrames = 0

for (const line of lines) {
  const parts = line.split(',')
  const appx = parts[0].replace(/"/g, '')
  const key = parts[1].replace(/"/g, '')
  const matchedName = parts[2].replace(/"/g, '')

  if (key === 'NONE') {
    zeroFrames++
    console.log(`[Unmapped] ${appx} -> NONE (0 frames)`)
    continue
  }

  mapped++
  const has0 = diskFiles.has(`${key}_0.jpg`)
  const has1 = diskFiles.has(`${key}_1.jpg`)

  if (has0 && has1) {
    twoFrames++
    console.log(`[2 Frames] ${appx} -> ${key} (${matchedName})`)
  } else if (has0) {
    oneFrame++
    console.log(`[1 Frame]  ${appx} -> ${key} (${matchedName})`)
  } else {
    zeroFrames++
    console.log(`[0 Frames] ${appx} -> ${key} (${matchedName})`)
  }
}

console.log({
  totalOwnerExercises: lines.length,
  mappedToCatalog: mapped,
  twoFrames,
  oneFrame,
  zeroFrames,
})
