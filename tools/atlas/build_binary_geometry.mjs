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

function clipTrianglesPlane(raw, splitZ, part) {
  const resultTriangles = []

  function interpolate(pa, pb, da, db) {
    const t = da / (da - db)
    return [
      pa[0] + t * (pb[0] - pa[0]),
      pa[1] + t * (pb[1] - pa[1]),
      splitZ
    ]
  }

  for (let i = 0; i < raw.indices.length; i += 3) {
    const i0 = raw.indices[i]
    const i1 = raw.indices[i + 1]
    const i2 = raw.indices[i + 2]

    const p0 = [raw.positions[i0 * 3], raw.positions[i0 * 3 + 1], raw.positions[i0 * 3 + 2]]
    const p1 = [raw.positions[i1 * 3], raw.positions[i1 * 3 + 1], raw.positions[i1 * 3 + 2]]
    const p2 = [raw.positions[i2 * 3], raw.positions[i2 * 3 + 1], raw.positions[i2 * 3 + 2]]

    const d0 = p0[2] - splitZ
    const d1 = p1[2] - splitZ
    const d2 = p2[2] - splitZ

    const eps = 1e-5
    const s0 = d0 >= -eps
    const s1 = d1 >= -eps
    const s2 = d2 >= -eps

    if (s0 && s1 && s2) {
      if (part === 'upper') resultTriangles.push([p0, p1, p2])
    } else if (!s0 && !s1 && !s2) {
      if (part === 'lower') resultTriangles.push([p0, p1, p2])
    } else if (s0 && !s1 && !s2) {
      const i01 = interpolate(p0, p1, d0, d1)
      const i02 = interpolate(p0, p2, d0, d2)
      if (part === 'upper') resultTriangles.push([p0, i01, i02])
      else {
        resultTriangles.push([p1, p2, i01])
        resultTriangles.push([p2, i02, i01])
      }
    } else if (s1 && !s0 && !s2) {
      const i10 = interpolate(p1, p0, d1, d0)
      const i12 = interpolate(p1, p2, d1, d2)
      if (part === 'upper') resultTriangles.push([p1, i12, i10])
      else {
        resultTriangles.push([p0, i10, p2])
        resultTriangles.push([p2, i10, i12])
      }
    } else if (s2 && !s0 && !s1) {
      const i20 = interpolate(p2, p0, d2, d0)
      const i21 = interpolate(p2, p1, d2, d1)
      if (part === 'upper') resultTriangles.push([p2, i20, i21])
      else {
        resultTriangles.push([p0, p1, i20])
        resultTriangles.push([p1, i21, i20])
      }
    } else if (!s0 && s1 && s2) {
      const i01 = interpolate(p0, p1, d0, d1)
      const i02 = interpolate(p0, p2, d0, d2)
      if (part === 'upper') {
        resultTriangles.push([p1, p2, i01])
        resultTriangles.push([p2, i02, i01])
      } else {
        resultTriangles.push([p0, i01, i02])
      }
    } else if (!s1 && s0 && s2) {
      const i10 = interpolate(p1, p0, d1, d0)
      const i12 = interpolate(p1, p2, d1, d2)
      if (part === 'upper') {
        resultTriangles.push([p0, i10, p2])
        resultTriangles.push([p2, i10, i12])
      } else {
        resultTriangles.push([p1, i12, i10])
      }
    } else if (!s2 && s0 && s1) {
      const i20 = interpolate(p2, p0, d2, d0)
      const i21 = interpolate(p2, p1, d2, d1)
      if (part === 'upper') {
        resultTriangles.push([p0, p1, i20])
        resultTriangles.push([p1, i21, i20])
      } else {
        resultTriangles.push([p2, i20, i21])
      }
    }
  }

  const positions = []
  const indices = []
  for (const tri of resultTriangles) {
    const idx = positions.length / 3
    for (const p of tri) {
      positions.push(p[0], p[1], p[2])
    }
    indices.push(idx, idx + 1, idx + 2)
  }
  return { positions, indices }
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
    const clipped = clipTrianglesPlane(raw, splitZ, part)
    const offset = mergedPos.length / 3
    for (let i = 0; i < clipped.positions.length; i++) mergedPos.push(clipped.positions[i])
    for (let i = 0; i < clipped.indices.length; i++) mergedIdx.push(clipped.indices[i] + offset)
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
