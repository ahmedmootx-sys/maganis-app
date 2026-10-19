import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function escapeCsv(str) {
  if (str === null || str === undefined) return '""'
  const s = String(str).replace(/"/g, '""')
  return `"${s}"`
}

async function run() {
  const { EXERCISES } = await import('../src/modules/workout/exercises.ts')
  const { resolveMedia } = await import('../src/utils/mediaResolver.ts')

  // 1. Read owner program mapping to know which exercises are owner-verified
  const ownerMappingPath = path.join(rootDir, 'docs/program-import-mapping.csv')
  const ownerLines = fs
    .readFileSync(ownerMappingPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(1)

  const ownerVerifiedKeys = new Set()
  const ownerProgramRows = []

  for (const line of ownerLines) {
    const parts = line.split(',')
    const appx = parts[0].replace(/"/g, '')
    const key = parts[1].replace(/"/g, '')
    const name = parts[2].replace(/"/g, '')
    const matchType = parts[3].replace(/"/g, '')
    const contentStatus = parts[4].replace(/"/g, '')

    if (key && key !== 'NONE') {
      ownerVerifiedKeys.add(key)
    }

    ownerProgramRows.push({
      appx,
      key,
      name,
      matchType,
      contentStatus,
    })
  }

  // 2. Generate docs/exercise-coverage.csv (all 261 catalog exercises)
  const catalogHeader =
    'id,name_en,name_ar,media_kind,frame_count,source,verified_by_owner\n'
  const catalogRows = []

  let catalogWithMedia = 0
  let catalogNullMedia = 0

  for (const ex of EXERCISES) {
    const res = resolveMedia(ex)
    let mediaKind = 'none'
    let frameCount = 0
    let source = 'none'

    if (res.url) {
      catalogWithMedia++
      if (res.isKeyframed && res.frame1Url && res.frame1Url !== res.url) {
        mediaKind = 'animated'
        frameCount = 2
        source = 'Free Exercise DB / Gym Visual'
      } else {
        mediaKind = 'static'
        frameCount = 1
        source = 'Free Exercise DB / Gym Visual'
      }
    } else {
      catalogNullMedia++
    }

    const verifiedByOwner = ownerVerifiedKeys.has(ex.id) ? 'true' : 'false'

    catalogRows.push(
      [
        escapeCsv(ex.id),
        escapeCsv(ex.nameEn || ex.name || ''),
        escapeCsv(ex.nameAr || ''),
        escapeCsv(mediaKind),
        frameCount,
        escapeCsv(source),
        escapeCsv(verifiedByOwner),
      ].join(','),
    )
  }

  fs.writeFileSync(
    path.join(rootDir, 'docs/exercise-coverage.csv'),
    catalogHeader + catalogRows.join('\n') + '\n',
    'utf8',
  )
  console.log(
    `✓ Generated docs/exercise-coverage.csv (${EXERCISES.length} exercises: ${catalogWithMedia} with media, ${catalogNullMedia} null media)`,
  )

  // 3. Generate docs/exercise-coverage-program.csv (owner's 41 exercises)
  const programHeader =
    'appendix_name,matched_key,matched_name,match_type,content_status,media_kind,frame_count,source,verified_by_owner\n'
  const programRows = []

  let ownerWithMedia = 0
  let ownerNullMedia = 0

  for (const row of ownerProgramRows) {
    let mediaKind = 'none'
    let frameCount = 0
    let source = 'none'
    let verifiedByOwner = 'false'

    if (row.key !== 'NONE') {
      verifiedByOwner = 'true'
      const res = resolveMedia(row.key)
      if (res.url) {
        ownerWithMedia++
        if (res.isKeyframed && res.frame1Url && res.frame1Url !== res.url) {
          mediaKind = 'animated'
          frameCount = 2
          source = 'Free Exercise DB / Gym Visual'
        } else {
          mediaKind = 'static'
          frameCount = 1
          source = 'Free Exercise DB / Gym Visual'
        }
      } else {
        ownerNullMedia++
      }
    } else {
      ownerNullMedia++
    }

    programRows.push(
      [
        escapeCsv(row.appx),
        escapeCsv(row.key),
        escapeCsv(row.name),
        escapeCsv(row.matchType),
        escapeCsv(row.contentStatus),
        escapeCsv(mediaKind),
        frameCount,
        escapeCsv(source),
        escapeCsv(verifiedByOwner),
      ].join(','),
    )
  }

  fs.writeFileSync(
    path.join(rootDir, 'docs/exercise-coverage-program.csv'),
    programHeader + programRows.join('\n') + '\n',
    'utf8',
  )
  console.log(
    `✓ Generated docs/exercise-coverage-program.csv (${ownerProgramRows.length} exercises: ${ownerWithMedia} with media, ${ownerNullMedia} without media)`,
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
