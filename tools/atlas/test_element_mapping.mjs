import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const elementPartsPath = path.join(projectRoot, '.cache', 'bp3d', 'isa_element_parts.txt')
const raw = fs.readFileSync(elementPartsPath, 'utf8')
const lines = raw.split(/\r?\n/)

const conceptToFiles = new Map() // conceptId -> Set of FJxxxx
const nameToFiles = new Map() // name (lower) -> Set of FJxxxx

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim()
  if (!line) continue
  const [conceptId, name, fileId] = line.split('\t')
  if (!conceptId || !fileId) continue

  if (!conceptToFiles.has(conceptId)) conceptToFiles.set(conceptId, new Set())
  conceptToFiles.get(conceptId).add(fileId)

  const n = (name || '').toLowerCase().trim()
  if (n) {
    if (!nameToFiles.has(n)) nameToFiles.set(n, new Set())
    nameToFiles.get(n).add(fileId)
  }
}

console.log(`Loaded ${conceptToFiles.size} concepts and ${nameToFiles.size} unique names from isa_element_parts.txt`)

// Check an example:
console.log('deltoid acromial (delt_lateral):', conceptToFiles.get('FMA34678'))
console.log('biceps long head:', conceptToFiles.get('FMA37683'))
console.log('gluteus maximus:', conceptToFiles.get('FMA22314'))
