const fs = require('fs')

// Require the compiled or evaluate the TS file
const exercisesTs = fs.readFileSync('src/modules/workout/exercises.ts', 'utf8')

// Extract EXERCISES json
const match = exercisesTs.match(
  /export const EXERCISES: Exercise\[\] = (\[[\s\S]*?\]);\n/,
)
if (!match) {
  console.error('Failed to parse EXERCISES from exercises.ts')
  process.exit(1)
}

const exercises = JSON.parse(match[1])
console.log(
  'Successfully loaded',
  exercises.length,
  'exercises for integrity testing.',
)

let errors = 0

// 1. Check ID uniqueness
const ids = new Set()
exercises.forEach((ex, idx) => {
  if (!ex.id) {
    console.error(`Exercise at index ${idx} missing ID`)
    errors++
  } else if (ids.has(ex.id)) {
    console.error(`Duplicate ID found: ${ex.id}`)
    errors++
  } else {
    ids.add(ex.id)
  }
})

// 2. Check Name uniqueness
const names = new Set()
exercises.forEach((ex) => {
  if (names.has(ex.name)) {
    console.error(`Duplicate English Name found: ${ex.name}`)
    errors++
  } else {
    names.add(ex.name)
  }
})

// 3. Check nameAr uniqueness
const namesAr = new Set()
exercises.forEach((ex) => {
  if (namesAr.has(ex.nameAr)) {
    console.warn(`Duplicate Arabic Name found: ${ex.nameAr} (id: ${ex.id})`)
    // Not fatal if intentional variation, but let's see
  } else {
    namesAr.add(ex.nameAr)
  }
})

// 4. Check valid category
const VALID_CATEGORIES = new Set([
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
])
exercises.forEach((ex) => {
  if (!VALID_CATEGORIES.has(ex.category)) {
    console.error(`Invalid category: ${ex.category} in ${ex.id}`)
    errors++
  }
})

// 5. Check valid equipment
const VALID_EQUIPMENT = new Set([
  'barbell',
  'dumbbell',
  'machine',
  'bodyweight',
  'band',
])
exercises.forEach((ex) => {
  if (!VALID_EQUIPMENT.has(ex.equipment)) {
    console.error(`Invalid equipment: ${ex.equipment} in ${ex.id}`)
    errors++
  }
})

// 6. Check targetMusclesAr
exercises.forEach((ex) => {
  if (!ex.targetMusclesAr || ex.targetMusclesAr.length === 0) {
    console.error(`Exercise ${ex.id} has no target muscles`)
    errors++
  }
})

// 7. Check howToStepsAr
exercises.forEach((ex) => {
  if (!ex.howToStepsAr || ex.howToStepsAr.length === 0) {
    console.error(`Exercise ${ex.id} has no how-to steps`)
    errors++
  } else if (ex.howToStepsAr.some((step) => !step || step.trim() === '')) {
    console.error(`Exercise ${ex.id} has empty step`)
    errors++
  }
})

// 8. Check image URLs
exercises.forEach((ex) => {
  if (!ex.imageUrl || !ex.thumbnailUrl) {
    console.error(`Exercise ${ex.id} has missing images`)
    errors++
  }
})

console.log(`\nIntegrity check finished with ${errors} fatal errors.`)
if (errors > 0) process.exit(1)

// 9. Test legacy IDs lookup in getExerciseById
const aliasMatch = exercisesTs.match(
  /export const EXERCISE_ALIASES: Record<string, string> = (\{[\s\S]*?\});\n/,
)
const aliases = JSON.parse(aliasMatch[1])

const legacyIds = [
  ...Array.from({ length: 20 }, (_, i) => `chest-${i + 1}`),
  ...Array.from({ length: 21 }, (_, i) => `back-${i + 1}`),
  ...Array.from({ length: 21 }, (_, i) => `leg-${i + 1}`),
  ...Array.from({ length: 20 }, (_, i) => `shoulder-${i + 1}`),
  ...Array.from({ length: 20 }, (_, i) => `arm-${i + 1}`),
  ...Array.from({ length: 20 }, (_, i) => `core-${i + 1}`),
]

let legacyMissing = 0
legacyIds.forEach((legId) => {
  const inMain = exercises.some((e) => e.id === legId)
  const inAlias =
    aliases[legId] && exercises.some((e) => e.id === aliases[legId])
  if (!inMain && !inAlias) {
    console.error(`Legacy ID ${legId} CANNOT be resolved!`)
    legacyMissing++
  }
})

console.log(
  `Legacy ID verification completed. Missing: ${legacyMissing}/${legacyIds.length}`,
)
if (legacyMissing > 0) process.exit(1)

console.log('All integrity & legacy checks passed with 100% SUCCESS!')
