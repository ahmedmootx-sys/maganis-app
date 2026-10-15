import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const atlasMusclesPath = path.join(projectRoot, 'data', 'atlas_muscles.json')
const elementPartsPath = path.join(projectRoot, '.cache', 'bp3d', 'isa_element_parts.txt')
const partsListPath = path.join(projectRoot, '.cache', 'bp3d', 'isa_parts_list_e.txt')
const objDir = path.join(projectRoot, '.cache', 'bp3d', 'obj', 'isa_BP3D_4.0_obj_99')

const atlasMusclesData = JSON.parse(fs.readFileSync(atlasMusclesPath, 'utf8'))
const elementPartsRaw = fs.readFileSync(elementPartsPath, 'utf8')
const partsListRaw = fs.readFileSync(partsListPath, 'utf8')

// Map concept -> OBJ files
const conceptToFiles = new Map()
for (const line of elementPartsRaw.split(/\r?\n/).slice(1)) {
  const [conceptId, name, fileId] = line.trim().split('\t')
  if (!conceptId || !fileId) continue
  if (!conceptToFiles.has(conceptId)) conceptToFiles.set(conceptId, new Set())
  conceptToFiles.get(conceptId).add(fileId)
}

// Map name -> concepts
const nameToConcepts = new Map()
for (const line of partsListRaw.split(/\r?\n/).slice(1)) {
  const [conceptId, repId, en] = line.trim().split('\t')
  if (!conceptId || !en) continue
  const lower = en.toLowerCase().trim()
  if (!nameToConcepts.has(lower)) nameToConcepts.set(lower, [])
  nameToConcepts.get(lower).push(conceptId)
}

function resolvePartFiles(name) {
  const lower = name.toLowerCase().trim()
  const concepts = new Set()

  if (nameToConcepts.has(lower)) {
    for (const c of nameToConcepts.get(lower)) concepts.add(c)
  }
  if (nameToConcepts.has(`left ${lower}`)) {
    for (const c of nameToConcepts.get(`left ${lower}`)) concepts.add(c)
  }
  if (nameToConcepts.has(`right ${lower}`)) {
    for (const c of nameToConcepts.get(`right ${lower}`)) concepts.add(c)
  }

  // flexor carpi ulnaris special anatomical heads resolution
  if (lower === 'flexor carpi ulnaris') {
    const heads = ['humeral head of flexor carpi ulnaris', 'ulnar head of flexor carpi ulnaris']
    for (const h of heads) {
      if (nameToConcepts.has(h)) for (const c of nameToConcepts.get(h)) concepts.add(c)
      if (nameToConcepts.has(`left ${h}`)) for (const c of nameToConcepts.get(`left ${h}`)) concepts.add(c)
      if (nameToConcepts.has(`right ${h}`)) for (const c of nameToConcepts.get(`right ${h}`)) concepts.add(c)
    }
  }

  const files = new Set()
  for (const c of concepts) {
    if (conceptToFiles.has(c)) {
      for (const f of conceptToFiles.get(c)) {
        files.add(f)
      }
    }
  }
  return { concepts: Array.from(concepts), files: Array.from(files) }
}

const resolvedMuscles = []

for (const m of atlasMusclesData.muscles) {
  const reqNames = [...(m.bp3d || [])]
  if (m.derive && m.derive.from) {
    for (const f of m.derive.from) {
      if (!reqNames.includes(f)) reqNames.push(f)
    }
  }

  const allFiles = new Set()
  const partsUsed = []

  for (const name of reqNames) {
    const res = resolvePartFiles(name)
    if (res.files.length > 0) {
      partsUsed.push({ name, ...res })
      for (const f of res.files) allFiles.add(f)
    }
  }

  for (const name of (m.bp3d_optional || [])) {
    const res = resolvePartFiles(name)
    if (res.files.length > 0) {
      partsUsed.push({ name, optional: true, ...res })
      for (const f of res.files) allFiles.add(f)
    }
  }

  // Filter only files that actually exist as OBJ on disk
  const existingFiles = []
  for (const f of allFiles) {
    const objPath = path.join(objDir, `${f}.obj`)
    if (fs.existsSync(objPath)) {
      existingFiles.push(f)
    }
  }

  resolvedMuscles.push({
    id: m.id,
    en: m.en,
    ar: m.ar,
    expected_views: m.expected_views,
    derived: m.derive,
    partsUsed,
    files: existingFiles,
    hasMesh: existingFiles.length > 0
  })
}

console.log(`Total muscles: ${resolvedMuscles.length}`)
const withMesh = resolvedMuscles.filter(m => m.hasMesh)
const withoutMesh = resolvedMuscles.filter(m => !m.hasMesh)

console.log(`Muscles WITH mesh files: ${withMesh.length} / ${resolvedMuscles.length}`)
console.log(`Muscles WITHOUT mesh files: ${withoutMesh.length}`)
for (const m of withoutMesh) {
  console.log(` - ${m.id} (${m.en})`)
}

fs.writeFileSync(path.join(projectRoot, 'tools', 'atlas', 'resolved_muscles.json'), JSON.stringify(resolvedMuscles, null, 2))
console.log('Saved tools/atlas/resolved_muscles.json')
