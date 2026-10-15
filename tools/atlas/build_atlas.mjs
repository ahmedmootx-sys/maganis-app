import { execSync } from 'node:child_process'
import path from 'node:path'

const projectRoot = process.cwd()

console.log('====================================================')
console.log('   Maganis Anatomical Muscle Atlas Build Pipeline   ')
console.log('====================================================\n')

const steps = [
  {
    name: 'Step 1: Resolve Muscles to BodyParts3D 4.0 Meshes',
    cmd: `node ${path.join('tools', 'atlas', 'resolve_all_muscles.mjs')}`
  },
  {
    name: 'Step 2: Build Aligned Binary Geometry Bundle',
    cmd: `node ${path.join('tools', 'atlas', 'build_binary_geometry.mjs')}`
  },
  {
    name: 'Step 3: Headless Three.js Render & Vectorization Pipeline',
    cmd: `node ${path.join('tools', 'atlas', 'render_server.mjs')}`
  }
]

const startTime = Date.now()

for (let i = 0; i < steps.length; i++) {
  const step = steps[i]
  console.log(`\n[${i + 1}/${steps.length}] ${step.name}...`)
  const stepStart = Date.now()
  try {
    execSync(step.cmd, { stdio: 'inherit', cwd: projectRoot })
    console.log(`✓ Completed in ${((Date.now() - stepStart) / 1000).toFixed(1)}s`)
  } catch (err) {
    console.error(`\n❌ Failed during: ${step.name}`)
    console.error(err)
    process.exit(1)
  }
}

console.log('\n====================================================')
console.log(`🎉 Atlas build succeeded in ${((Date.now() - startTime) / 1000).toFixed(1)}s!`)
console.log('Generated static assets are ready in public/atlas/:')
console.log(' - public/atlas/anterior.svg')
console.log(' - public/atlas/posterior.svg')
console.log(' - public/atlas/shade-anterior.webp')
console.log(' - public/atlas/shade-posterior.webp')
console.log(' - public/atlas/atlas-meta.json')
console.log(' - public/atlas/debug.html')
console.log('====================================================\n')
