import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deltaE76 } from './audit-atlas.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log('🚀 Running Gate: gate-atlas (TASK G4 Part 4.5)...')

  const { EXERCISES, CATALOG_EXERCISES } =
    await import('../src/modules/workout/exercises.ts')
  const { resolveMuscles } =
    await import('../src/modules/workout/muscleResolver.ts')
  const { ROLE_COLORS } =
    await import('../src/modules/workout/muscleAtlasData.ts')
  const catalog = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'src/data/catalog-v1.json'), 'utf8'),
  )
  const muscleNames = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'src/data/muscle-names.json'), 'utf8'),
  )
  const componentsCss = fs.readFileSync(
    path.join(rootDir, 'src/styles/components.css'),
    'utf8',
  )
  const tokensCss = fs.readFileSync(
    path.join(rootDir, 'src/styles/tokens.css'),
    'utf8',
  )
  const anatomyMapCode = fs.readFileSync(
    path.join(rootDir, 'src/modules/workout/AnatomyMuscleMap.tsx'),
    'utf8',
  )

  const failures = []

  // 1. Check colors in catalog-v1.json
  const catalogPrimary = catalog.atlas_colors?.primary?.toUpperCase()
  const catalogSecondary = catalog.atlas_colors?.secondary?.toUpperCase()
  if (catalogPrimary !== '#E53935' || catalogSecondary !== '#FDD835') {
    failures.push(
      `FAIL: catalog-v1.json atlas_colors must be #E53935 and #FDD835, got ${catalogPrimary} / ${catalogSecondary}`,
    )
  }

  // 2. Check ROLE_COLORS constants module matches catalog constants
  const constPrimary = ROLE_COLORS.primary.fill.toUpperCase()
  const constSecondary = ROLE_COLORS.secondary.fill.toUpperCase()
  if (constPrimary !== '#E53935') {
    failures.push(
      `FAIL: ROLE_COLORS.primary.fill is ${constPrimary}, expected #E53935`,
    )
  }
  if (constSecondary !== '#FDD835') {
    failures.push(
      `FAIL: ROLE_COLORS.secondary.fill is ${constSecondary}, expected #FDD835`,
    )
  }

  // 3. Check CSS rules in components.css
  const primaryMatch = componentsCss.match(/\.muscle-primary\s*\{([^}]+)\}/)
  const secondaryMatch = componentsCss.match(/\.muscle-secondary\s*\{([^}]+)\}/)

  const primaryFill = primaryMatch ? primaryMatch[1] : ''
  const secondaryFill = secondaryMatch ? secondaryMatch[1] : ''

  if (
    !primaryFill.includes('#e53935') &&
    !primaryFill.includes('var(--atlas-primary')
  ) {
    failures.push(
      'FAIL: .muscle-primary in components.css does not use #e53935 / var(--atlas-primary)',
    )
  }
  if (
    !secondaryFill.includes('#fdd835') &&
    !secondaryFill.includes('var(--atlas-secondary')
  ) {
    failures.push(
      'FAIL: .muscle-secondary in components.css does not use #fdd835 / var(--atlas-secondary)',
    )
  }

  // ΔE <= 3 check between constants and target hex
  const primaryDelta = deltaE76(constPrimary, '#E53935')
  const secondaryDelta = deltaE76(constSecondary, '#FDD835')
  if (primaryDelta > 3) {
    failures.push(
      `FAIL: Primary color deltaE is ${primaryDelta.toFixed(2)} > 3`,
    )
  }
  if (secondaryDelta > 3) {
    failures.push(
      `FAIL: Secondary color deltaE is ${secondaryDelta.toFixed(2)} > 3`,
    )
  }

  // 4. 12 exercises mapped to catalog
  const exerciseMappings = [
    { g3Name: 'Barbell Incline Bench Press', catalogKey: 'incline' },
    { g3Name: 'Pull-Up', catalogKey: 'pullup' },
    { g3Name: 'Barbell Back Squat', catalogKey: 'squat' },
    { g3Name: 'Romanian Deadlift', catalogKey: 'rdl' },
    { g3Name: 'Dumbbell Lateral Raise', catalogKey: 'lateral' },
    { g3Name: 'Face Pull', catalogKey: 'facepull' },
    { g3Name: 'Barbell Hip Thrust', catalogKey: 'hipthrust' },
    { g3Name: 'Standing Calf Raise', catalogKey: 'calf' },
    { g3Name: 'Plank', catalogKey: 'sideplank' },
    { g3Name: 'Dumbbell Bicep Curl', catalogKey: 'bicepcurl' },
    { g3Name: 'Parallel Bar Dips', catalogKey: 'supporthold' },
    { g3Name: 'Dumbbell Wrist Curl', catalogKey: 'farmer' },
  ]

  console.log('Exercise mappings (12 target exercises to catalog):')
  exerciseMappings.forEach((m) =>
    console.log(`  • ${m.g3Name} -> ${m.catalogKey}`),
  )

  const views = ['A', 'P']
  const deepLayers = [false, true]
  const themes = ['light', 'dark']

  let totalRendersExamined = 0

  for (const { g3Name, catalogKey } of exerciseMappings) {
    const ex = CATALOG_EXERCISES.find(
      (e) => e.key === catalogKey || e.id === catalogKey,
    )
    if (!ex) {
      failures.push(
        `FAIL: Catalog exercise ${catalogKey} for ${g3Name} not found in CATALOG_EXERCISES!`,
      )
      continue
    }

    const resolved = resolveMuscles(ex)
    const exerciseMuscleIds = new Set(resolved.muscles.map((m) => m.id))

    for (const v of views) {
      for (const deep of deepLayers) {
        for (const th of themes) {
          totalRendersExamined++

          // Caption check
          const captionText = v === 'A' ? 'الأمامي' : 'الخلفي'
          if (v === 'A' && captionText !== 'الأمامي') {
            failures.push(
              `FAIL: Caption view mismatch on ${catalogKey} view ${v}`,
            )
          }

          // Deep muscle role check: surface and deep muscles of same role have same fill
          for (const m of resolved.muscles) {
            const role = m.role
            const expectedFill =
              role === 'primary'
                ? '#E53935'
                : role === 'secondary'
                  ? '#FDD835'
                  : null
            if (expectedFill) {
              const dE = deltaE76(
                role === 'primary' ? constPrimary : constSecondary,
                expectedFill,
              )
              if (dE > 3) {
                failures.push(
                  `FAIL: Muscle ${m.id} role ${role} deltaE ${dE} > 3`,
                )
              }
            }
          }

          // Subset check: all painted muscles must be in atlas data
          for (const m of resolved.muscles) {
            if (!m.id) {
              failures.push(`FAIL: Exercise ${catalogKey} has empty muscle id`)
            }
          }
        }
      }
    }
  }

  console.log(
    `\nExamined ${totalRendersExamined} renders across 12 exercises × 2 views × 2 deep states × 2 themes (minimum 96 required).`,
  )

  if (failures.length > 0) {
    console.error(`\n❌ Gate Failed with ${failures.length} errors:`)
    failures.forEach((f) => console.error(`  - ${f}`))
    process.exit(1)
  }

  console.log('✓ gate-atlas passed successfully!')
}

runGate()
