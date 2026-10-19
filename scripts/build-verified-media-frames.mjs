import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function run() {
  const { EXERCISES } = await import('../src/modules/workout/exercises.ts')
  const diskFiles = new Set(
    fs.readdirSync(path.join(rootDir, 'public/exercises')),
  )

  const existingFramesPath = path.join(rootDir, 'src/data/media-frames.json')
  let existingMeta = {}
  if (fs.existsSync(existingFramesPath)) {
    existingMeta = JSON.parse(fs.readFileSync(existingFramesPath, 'utf8'))
  }

  const updatedExercises = {}

  // 1. Process all catalog exercises
  for (const ex of EXERCISES) {
    const f0Name = `${ex.id}_0.jpg`
    const f1Name = `${ex.id}_1.jpg`

    const has0 = diskFiles.has(f0Name)
    const has1 = diskFiles.has(f1Name)

    if (has0 && has1) {
      const s0 = fs.statSync(
        path.join(rootDir, 'public/exercises', f0Name),
      ).size
      const s1 = fs.statSync(
        path.join(rootDir, 'public/exercises', f1Name),
      ).size

      if (s0 > 0 && s1 > 0) {
        updatedExercises[ex.id] = {
          exerciseKey: ex.id,
          matchedName: ex.nameEn || ex.name || ex.id,
          frameCount: 2,
          confirmed: true,
          frames: [
            { index: 0, url: `/exercises/${f0Name}`, label: 'بداية' },
            { index: 1, url: `/exercises/${f1Name}`, label: 'نهاية' },
          ],
          startFrame: 0,
          endFrame: 1,
        }
      }
    }
  }

  const output = {
    version: 2,
    generatedAt: new Date().toISOString(),
    ffmpegAvailable: false,
    exercises: updatedExercises,
  }

  fs.writeFileSync(existingFramesPath, JSON.stringify(output, null, 2), 'utf8')
  console.log(
    `✓ Wrote ${Object.keys(updatedExercises).length} verified exercises into media-frames.json`,
  )

  // Also update public/exercises/exerciseMediaMap.json for runtime consistency
  const mapPath = path.join(rootDir, 'public/exercises/exerciseMediaMap.json')
  const mapOutput = {}
  for (const [id, entry] of Object.entries(updatedExercises)) {
    mapOutput[id] = {
      thumbnail: entry.frames[0].url,
      images: [entry.frames[0].url, entry.frames[1].url],
      matchedName: entry.matchedName,
    }
  }
  fs.writeFileSync(mapPath, JSON.stringify(mapOutput, null, 2), 'utf8')
  console.log(
    `✓ Wrote ${Object.keys(mapOutput).length} entries into exerciseMediaMap.json`,
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
