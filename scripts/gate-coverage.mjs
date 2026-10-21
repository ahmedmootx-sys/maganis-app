import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const catalogPath = path.join(rootDir, 'src', 'data', 'catalog-v1.json')
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

console.log('--- GATE CATALOG COVERAGE ---')
console.log(`Analyzing ${catalog.exercises.length} catalog exercises...\n`)

const columns = [
  { name: 'name_en', check: (e) => Boolean(e.name_en) },
  { name: 'name_ar', check: (e) => Boolean(e.name_ar) },
  { name: 'category', check: (e) => Boolean(e.category) },
  { name: 'kind', check: (e) => Boolean(e.kind) },
  {
    name: 'equipment',
    check: (e) => Boolean(e.equipment?.ar && e.equipment?.db),
  },
  { name: 'level', check: (e) => Boolean(e.level?.ar && e.level?.db) },
  { name: 'target_ar', check: (e) => Boolean(e.target_ar) },
  {
    name: 'muscles (>=1 primary)',
    check: (e) =>
      Array.isArray(e.muscles) && e.muscles.some((m) => m.role === 'primary'),
  },
  { name: 'benefit_ar', check: (e) => Boolean(e.benefit_ar) },
  { name: 'mechanics_ar', check: (e) => Boolean(e.mechanics_ar) },
  {
    name: 'steps_ar (>=3 steps)',
    check: (e) => Array.isArray(e.steps_ar) && e.steps_ar.length >= 3,
  },
  {
    name: 'common_mistakes_ar',
    check: (e) =>
      Array.isArray(e.common_mistakes_ar) && e.common_mistakes_ar.length > 0,
  },
  {
    name: 'rest_seconds',
    check: (e) => typeof e.rest_seconds === 'number' && e.rest_seconds >= 0,
  },
  {
    name: 'references (>=1)',
    check: (e) => Array.isArray(e.references) && e.references.length > 0,
  },
  {
    name: 'media.gif (exact display)',
    check: (e) =>
      e.media?.gif?.display === true && e.media?.gif?.match === 'exact',
  },
  {
    name: 'media.frames (exact display)',
    check: (e) =>
      e.media?.frames?.display === true && e.media?.frames?.match === 'exact',
  },
]

const total = catalog.exercises.length
let table = []

for (const col of columns) {
  const count = catalog.exercises.filter(col.check).length
  const pct = ((count / total) * 100).toFixed(1)
  table.push({
    Column: col.name,
    Count: `${count}/${total}`,
    'Coverage %': `${pct}%`,
  })
}

console.table(table)
console.log('PASSED: gate-coverage executed successfully.')
