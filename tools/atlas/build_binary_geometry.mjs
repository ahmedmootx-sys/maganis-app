import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const objDir = path.join(projectRoot, '.cache', 'bp3d', 'obj', 'isa_BP3D_4.0_obj_99')
const resolvedMusclesPath = path.join(projectRoot, 'tools', 'atlas', 'resolved_muscles.json')

if (!fs.existsSync(resolvedMusclesPath)) {
  console.error('resolved_muscles.json not found! Run resolve_all_muscles.mjs first.')
  process.exit(1)
}

const resolvedMuscles = JSON.parse(fs.readFileSync(resolvedMusclesPath, 'utf8'))

function parseOBJ(text) {
  const positions = []
  const indices = []
  for (const line of text.split('\n')) {
    if (line.startsWith('v ')) {
      const parts = line.trim().split(/\s+/)
      positions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]))
    } else if (line.startsWith('f ')) {
      const parts = line.trim().split(/\s+/)
      indices.push(
        parseInt(parts[1].split('/')[0], 10) - 1,
        parseInt(parts[2].split('/')[0], 10) - 1,
        parseInt(parts[3].split('/')[0], 10) - 1
      )
    }
  }
  return { positions: new Float32Array(positions), indices: new Uint32Array(indices) }
}

const objCache = new Map()
function getOBJ(fileId) {
  if (objCache.has(fileId)) return objCache.get(fileId)
  const p = path.join(objDir, `${fileId}.obj`)
  if (!fs.existsSync(p)) {
    throw new Error(`OBJ file missing: ${p}`)
  }
  const parsed = parseOBJ(fs.readFileSync(p, 'utf8'))
  objCache.set(fileId, parsed)
  return parsed
}

function getSplitPec(part) {
  const mergedPos = []
  const mergedIdx = []
  for (const f of ['FJ1464', 'FJ1464M']) {
    const raw = getOBJ(f)
    let minZ = Infinity
    let maxZ = -Infinity
    for (let i = 2; i < raw.positions.length; i += 3) {
      const z = raw.positions[i]
      if (z < minZ) minZ = z
      if (z > maxZ) maxZ = z
    }
    const splitZ = minZ + 0.35 * (maxZ - minZ)
    const offset = mergedPos.length / 3
    for (let i = 0; i < raw.positions.length; i++) mergedPos.push(raw.positions[i])
    for (let i = 0; i < raw.indices.length; i += 3) {
      const v0 = raw.indices[i]
      const v1 = raw.indices[i + 1]
      const v2 = raw.indices[i + 2]
      const z = (raw.positions[v0 * 3 + 2] + raw.positions[v1 * 3 + 2] + raw.positions[v2 * 3 + 2]) / 3
      if (part === 'upper' && z >= splitZ) {
        mergedIdx.push(v0 + offset, v1 + offset, v2 + offset)
      } else if (part === 'lower' && z < splitZ) {
        mergedIdx.push(v0 + offset, v1 + offset, v2 + offset)
      }
    }
  }
  return { positions: new Float32Array(mergedPos), indices: new Uint32Array(mergedIdx) }
}

console.log('Building geometry for muscles...')
const muscleGeometries = []

for (const m of resolvedMuscles) {
  if (!m.hasMesh) continue
  let geom
  if (m.id === 'pec_sternal') {
    geom = getSplitPec('upper')
  } else if (m.id === 'pec_costal') {
    geom = getSplitPec('lower')
  } else {
    const mergedPos = []
    const mergedIdx = []
    for (const f of m.files) {
      const raw = getOBJ(f)
      const offset = mergedPos.length / 3
      for (let i = 0; i < raw.positions.length; i++) mergedPos.push(raw.positions[i])
      for (let i = 0; i < raw.indices.length; i++) mergedIdx.push(raw.indices[i] + offset)
    }
    geom = { positions: new Float32Array(mergedPos), indices: new Uint32Array(mergedIdx) }
  }

  muscleGeometries.push({
    id: m.id,
    ar: m.ar,
    en: m.en,
    expected_views: m.expected_views,
    derived: !!m.derived,
    parts_used: m.files,
    positions: geom.positions,
    indices: geom.indices
  })
}

// Build silhouette geometry from Skin (FJ2810) and Hair (FJ2813)
console.log('Building silhouette geometry (Skin + Hair)...')
const silPos = []
const silIdx = []
for (const f of ['FJ2810', 'FJ2813']) {
  const raw = getOBJ(f)
  const offset = silPos.length / 3
  for (let i = 0; i < raw.positions.length; i++) silPos.push(raw.positions[i])
  for (let i = 0; i < raw.indices.length; i++) silIdx.push(raw.indices[i] + offset)
}

const silhouetteGeom = {
  id: 'body-silhouette',
  positions: new Float32Array(silPos),
  indices: new Uint32Array(silIdx)
}

const allItems = [...muscleGeometries, silhouetteGeom]

// Calculate total byte length
let totalBytes = 0
for (const item of allItems) {
  totalBytes += item.positions.byteLength
  totalBytes += item.indices.byteLength
}

console.log(`Packing raw geometry for ${allItems.length} items (${(totalBytes / 1024 / 1024).toFixed(2)} MB)...`)
const buffer = Buffer.alloc(totalBytes)
let byteOffset = 0
const metaList = []

for (const item of allItems) {
  const posOffset = byteOffset
  const posCount = item.positions.length
  const posBytes = Buffer.from(item.positions.buffer, item.positions.byteOffset, item.positions.byteLength)
  posBytes.copy(buffer, byteOffset)
  byteOffset += posBytes.length

  const idxOffset = byteOffset
  const idxCount = item.indices.length
  const idxBytes = Buffer.from(item.indices.buffer, item.indices.byteOffset, item.indices.byteLength)
  idxBytes.copy(buffer, byteOffset)
  byteOffset += idxBytes.length

  metaList.push({
    id: item.id,
    ar: item.ar,
    en: item.en,
    expected_views: item.expected_views,
    derived: item.derived,
    parts_used: item.parts_used,
    posOffset,
    posCount,
    idxOffset,
    idxCount,
    numVertices: posCount / 3,
    numTriangles: idxCount / 3
  })
}

const binPath = path.join(projectRoot, 'tools', 'atlas', 'geometry_bundle.bin')
const metaPath = path.join(projectRoot, 'tools', 'atlas', 'geometry_meta.json')

fs.writeFileSync(binPath, buffer)
fs.writeFileSync(metaPath, JSON.stringify(metaList, null, 2))

console.log(`Saved ${binPath} (${(fs.statSync(binPath).size / 1024 / 1024).toFixed(2)} MB)`)
console.log(`Saved ${metaPath}`)
