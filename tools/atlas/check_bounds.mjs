import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const objDir = path.join(projectRoot, '.cache', 'bp3d', 'obj', 'isa_BP3D_4.0_obj_99')

let minX = Infinity, maxX = -Infinity
let minY = Infinity, maxY = -Infinity
let minZ = Infinity, maxZ = -Infinity

const files = fs.readdirSync(objDir).filter(f => f.endsWith('.obj'))
console.log(`Checking bounds across ${files.length} OBJ files...`)

let checked = 0
for (const file of files) {
  const content = fs.readFileSync(path.join(objDir, file), 'utf8')
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.startsWith('Bounds(mm):') || line.startsWith('# Bounds(mm):')) {
      // # Bounds(mm): (-145.400800,-78.011500,667.744600)-(1.724200,20.199500,932.557100)
      const numbers = line.match(/-?\d+\.?\d*(?:e[+-]?\d+)?/gi)
      if (numbers && numbers.length >= 6) {
        const [x1, y1, z1, x2, y2, z2] = numbers.map(Number)
        minX = Math.min(minX, x1, x2); maxX = Math.max(maxX, x1, x2)
        minY = Math.min(minY, y1, y2); maxY = Math.max(maxY, y1, y2)
        minZ = Math.min(minZ, z1, z2); maxZ = Math.max(maxZ, z1, z2)
        checked++
        break
      }
    }
  }
}

console.log(`Checked ${checked} files. Overall Bounding Box:`)
console.log(`X (left/right): [${minX.toFixed(2)}, ${maxX.toFixed(2)}] (width: ${(maxX - minX).toFixed(2)} mm)`)
console.log(`Y (front/back): [${minY.toFixed(2)}, ${maxY.toFixed(2)}] (depth: ${(maxY - minY).toFixed(2)} mm)`)
console.log(`Z (height):     [${minZ.toFixed(2)}, ${maxZ.toFixed(2)}] (height: ${(maxZ - minZ).toFixed(2)} mm)`)
