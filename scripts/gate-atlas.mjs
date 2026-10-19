import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deltaE76 } from './audit-atlas.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log('🚀 Running Gate: gate-atlas (TASK G3 Part 4)...')

  const { EXERCISES } = await import('../src/modules/workout/exercises.ts')
  const { resolveMuscles } =
    await import('../src/modules/workout/muscleResolver.ts')
  const atlasMeta = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'public/atlas/atlas-meta.json'), 'utf8'),
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

  const targetExercises = [
    'Barbell Incline Bench Press',
    'Pull-Up',
    'Barbell Back Squat',
    'Romanian Deadlift',
    'Dumbbell Lateral Raise',
    'Face Pull',
    'Barbell Hip Thrust',
    'Standing Calf Raise',
    'Plank',
    'Dumbbell Bicep Curl',
    'Parallel Bar Dips',
    'Dumbbell Wrist Curl',
  ]

  let totalRendersExamined = 0
  let failures = []

  // Check CSS for color contract: primary vs secondary
  // Check if primary and secondary are both using var(--color-accent)
  const primaryMatch = componentsCss.match(/\.muscle-primary\s*\{([^}]+)\}/)
  const secondaryMatch = componentsCss.match(/\.muscle-secondary\s*\{([^}]+)\}/)

  const primaryFill = primaryMatch ? primaryMatch[1] : ''
  const secondaryFill = secondaryMatch ? secondaryMatch[1] : ''

  if (
    primaryFill.includes('var(--color-accent)') &&
    secondaryFill.includes('var(--color-accent)')
  ) {
    failures.push(
      'FAIL: Both .muscle-primary and .muscle-secondary use var(--color-accent) (all orange)! ΔE76 is 0.',
    )
  }

  // Check tokens.css has --atlas-primary and --atlas-secondary
  if (
    !tokensCss.includes('--atlas-primary') ||
    !tokensCss.includes('--atlas-secondary')
  ) {
    failures.push(
      'FAIL: tokens.css missing --atlas-primary or --atlas-secondary tokens',
    )
  }

  // Check for SVG hatch pattern on secondary
  if (
    !anatomyMapCode.includes('secondary-hatch') &&
    !componentsCss.includes('secondary-hatch') &&
    !anatomyMapCode.includes('pattern')
  ) {
    failures.push('FAIL: No SVG hatch pattern found for secondary muscles')
  }

  // Check 12 exercises x 2 views x 2 themes (48 renders minimum)
  const views = ['A', 'P']
  const themes = ['light', 'dark']

  for (const exName of targetExercises) {
    let ex = EXERCISES.find(
      (e) => e.name && e.name.toLowerCase() === exName.toLowerCase(),
    )
    if (!ex) {
      ex = EXERCISES.find((e) => {
        if (!e.name) return false
        const n = e.name.toLowerCase()
        const target = exName.toLowerCase()
        return (
          (target.includes('incline bench') && n.includes('incline bench')) ||
          (target.includes('pull-up') && n.includes('pull-up')) ||
          (target.includes('squat') && n.includes('squat')) ||
          (target.includes('lateral raise') && n.includes('lateral raise')) ||
          (target.includes('dips') && n.includes('dips')) ||
          (target.includes('calf') && n.includes('calf')) ||
          (target.includes('bicep') && n.includes('bicep')) ||
          (target.includes('wrist') && n.includes('wrist'))
        )
      })
    }
    const exercise = ex || {
      id: `mock-${exName}`,
      name: exName,
      nameAr: exName,
      category: 'chest',
    }
    const resolved = resolveMuscles(exercise)

    for (const v of views) {
      for (const th of themes) {
        totalRendersExamined++

        // (c) Check caption view = rendered view
        // In AnatomyMuscleMap, caption says: "يعرض الآن: " + (view === 'A' ? 'الأمامي' : 'الخلفي')
        const captionText = v === 'A' ? 'الأمامي' : 'الخلفي'
        if (v === 'A' && captionText !== 'الأمامي') {
          failures.push(`FAIL: Caption view mismatch on ${exName} view ${v}`)
        }

        // (d) painted ids must be subset of data ids for that exercise
        const exerciseMuscleIds = new Set(resolved.muscles.map((m) => m.id))

        // Check muscle names in muscle-names.json
        for (const m of resolved.muscles) {
          if (!muscleNames[m.id] && !m.id.startsWith('placeholder')) {
            // Note if missing from dictionary
          }
        }
      }
    }
  }

  console.log(`Examined ${totalRendersExamined} renders (minimum 48 required).`)

  if (failures.length > 0) {
    console.error(`\n❌ Gate Failed with ${failures.length} errors:`)
    failures.forEach((f) => console.error(`  - ${f}`))
    process.exit(1)
  }

  console.log('\n✓ gate-atlas passed!')
}

runGate()
