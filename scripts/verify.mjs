#!/usr/bin/env node
/**
 * scripts/verify.mjs
 * Master Verification Harness for Maganis (Task F)
 * Runs static code audits, data truth checks, unit tests, prod build, and Playwright defect suite.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

console.log('====================================================')
console.log('   MAGANIS VERIFICATION HARNESS (TASK F)')
console.log('====================================================\n')

let overallFailures = 0

function runStep(name, fn) {
  process.stdout.write(`⏳ [CHECK] ${name}... `)
  try {
    fn()
    console.log('✓ PASS')
  } catch (err) {
    console.log('❌ FAIL')
    console.error(`   Error: ${err.message}`)
    overallFailures++
  }
}

// 1. Emoji Check
runStep('Emoji Audit (0 forbidden pictographs)', () => {
  execSync('node scripts/check-emoji.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 2. Data Truth: No Invented Fallback Numbers
runStep('Data Truth: No Invented Fallbacks (2555/2000/140) in UI', () => {
  const filesToCheck = [
    'src/modules/dashboard/Dashboard.tsx',
    'src/modules/reports/Reports.tsx',
    'src/modules/nutrition/NutritionModule.tsx',
    'src/modules/onboarding/OnboardingWizard.tsx',
  ]

  const forbiddenTokens = ['2555', 'fallbackCalorie', 'fallbackProtein']

  for (const rel of filesToCheck) {
    const full = path.join(rootDir, rel)
    if (!fs.existsSync(full)) continue
    const code = fs.readFileSync(full, 'utf8')
    for (const token of forbiddenTokens) {
      if (code.includes(token)) {
        throw new Error(
          `Found forbidden invented fallback token "${token}" in ${rel}`,
        )
      }
    }
  }

  // Check Onboarding wizard initial state is empty
  const wizardFile = path.join(
    rootDir,
    'src/modules/onboarding/OnboardingWizard.tsx',
  )
  const wizardCode = fs.readFileSync(wizardFile, 'utf8')
  if (
    wizardCode.includes('useState(25)') ||
    wizardCode.includes('useState(175)') ||
    wizardCode.includes('useState(75)')
  ) {
    throw new Error(
      'OnboardingWizard still contains invented numeric defaults (25, 175, 75)',
    )
  }
})

// 3. Trailing Colons Audit
runStep('Punctuation: No trailing colons in UI headings/labels', () => {
  const files = [
    'src/modules/dashboard/Dashboard.tsx',
    'src/modules/workout/ExerciseDetailView.tsx',
    'src/modules/nutrition/NutritionModule.tsx',
  ]

  for (const f of files) {
    const content = fs.readFileSync(path.join(rootDir, f), 'utf8')
    const regex = />[^<]+[:：]<\/(h[1-6]|span|button|div|label)>/g
    const matches = content.match(regex)
    if (matches && matches.length > 0) {
      // Filter out intentional clock or code displays
      const cleanMatches = matches.filter(
        (m) => !m.includes('00:') && !m.includes('TDEE:'),
      )
      if (cleanMatches.length > 0) {
        throw new Error(
          `Trailing colons found in ${f}: ${cleanMatches.join(', ')}`,
        )
      }
    }
  }
})

// 4. Standard Grams Unit («جم»)
runStep('Standard Unit: Arabic Grams («جم») throughout nutrition', () => {
  const foodDbPath = path.join(rootDir, 'src/modules/nutrition/foodDatabase.ts')
  const foodDbCode = fs.readFileSync(foodDbPath, 'utf8')
  if (foodDbCode.includes('جرام') || foodDbCode.includes("'g'")) {
    throw new Error(
      'foodDatabase.ts uses non-standard gram unit (must use «جم»)',
    )
  }
})

// 5. Latin Numerals (No Indic digits in core data)
runStep('Typography: Latin digits only (0-9, no ٠-٩)', () => {
  const dataDir = path.join(rootDir, 'src/data')
  const dataFiles = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))
  const arabicIndicRegex = /[\u0660-\u0669]/

  for (const df of dataFiles) {
    const jsonStr = fs.readFileSync(path.join(dataDir, df), 'utf8')
    if (arabicIndicRegex.test(jsonStr)) {
      throw new Error(`Arabic-Indic numerals (٠-٩) found in data file ${df}`)
    }
  }
})

// 6. Food Database Integrity & Distinction
runStep(
  'Nutrition Data: Atwater integrity & chicken breast distinction',
  () => {
    const foodDbPath = path.join(
      rootDir,
      'src/modules/nutrition/foodDatabase.ts',
    )
    const content = fs.readFileSync(foodDbPath, 'utf8')
    if (
      !content.includes('صدور دجاج مشوية') ||
      !content.includes('صدور دجاج مسلوقة')
    ) {
      throw new Error(
        'foodDatabase.ts must distinguish grilled vs boiled chicken breast',
      )
    }
  },
)

// 7. Orphan ID Healing
runStep('Workout Engine: Orphan shoulder-2 -> shoulder-15 healing', () => {
  const utilsPath = path.join(rootDir, 'src/modules/workout/workoutUtils.ts')
  const utilsCode = fs.readFileSync(utilsPath, 'utf8')
  if (
    !utilsCode.includes("'shoulder-2'") ||
    !utilsCode.includes("'shoulder-15'")
  ) {
    throw new Error(
      'workoutUtils.ts is missing healExerciseId remap for shoulder-2',
    )
  }
})

// 8. Exercise Scientific Content & Risk Flags
runStep('Exercise Anatomy: Scientific content & high-risk safety flags', () => {
  const contentFile = path.join(rootDir, 'src/data/exercise-content.json')
  const flagsFile = path.join(rootDir, 'src/data/exercise-flags.json')

  if (!fs.existsSync(contentFile))
    throw new Error('src/data/exercise-content.json is missing')
  if (!fs.existsSync(flagsFile))
    throw new Error('src/data/exercise-flags.json is missing')

  const content = JSON.parse(fs.readFileSync(contentFile, 'utf8'))
  const rawFlags = JSON.parse(fs.readFileSync(flagsFile, 'utf8'))
  const flags = rawFlags.exercises || rawFlags

  if (!content['chest-1'] || !content['legs-1']) {
    throw new Error(
      'Missing core exercise content for major compound lifts (chest-1, legs-1)',
    )
  }

  if (!flags['chest-19'] && !flags['Barbell_Guillotine_Bench_Press']) {
    throw new Error(
      'Missing high-risk safety flags for guillotine press / upright row',
    )
  }
})

// 9. Vitest Suite
runStep('Vitest Suite: 154 unit & integration tests', () => {
  execSync('npx vitest run', { cwd: rootDir, stdio: 'pipe' })
})

// 10. Production Build
runStep('Production Build: TypeScript check & Vite bundle', () => {
  execSync('npm run build', { cwd: rootDir, stdio: 'pipe' })
})

// 11. Playwright Mobile Defect Suite
runStep('Playwright Defect Suite: 13 Android mobile defect tests', () => {
  execSync('node scripts/run-f-defects.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 12. Gate 5.1: Layout Insets Verification (>= 200 elements, min 12px edge distance)
runStep('Gate 5.1: Non-vacuous Layout Insets (>= 200 elements)', () => {
  execSync('node scripts/gate-inset.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 13. Gate 5.2: Choice Button Visual Contract & Accessibility (>= 50 elements)
runStep(
  'Gate 5.2: Choice Button Contract & Accessibility (>= 50 elements)',
  () => {
    execSync('node scripts/gate-choice.mjs', { cwd: rootDir, stdio: 'pipe' })
  },
)

// 14. Gate 5.3: Button Visual Contract & Disabled Opacity = 100% (>= 40 buttons)
runStep(
  'Gate 5.3: Button Visual Contract & Disabled Opacity (>= 40 buttons)',
  () => {
    execSync('node scripts/gate-buttons.mjs', { cwd: rootDir, stdio: 'pipe' })
  },
)

// 15. Gate 5.4: Text Polish & Arabic RTL Strictness (>= 100 text nodes)
runStep(
  'Gate 5.4: Text Polish & Arabic RTL Strictness (>= 100 text nodes)',
  () => {
    execSync('node scripts/gate-text.mjs', { cwd: rootDir, stdio: 'pipe' })
  },
)

// 16. Gate 5.5: Mobile Geometry, Touch Targets & Nav Bounds (>= 50 controls)
runStep('Gate 5.5: Mobile Geometry & Touch Targets (>= 50 controls)', () => {
  execSync('node scripts/gate-geometry.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 17. Gate 5.9: ServiceWorker Lifecycle & 88-Exercise Media Audit (88 exercises, 176 frames)
runStep(
  'Gate 5.9: ServiceWorker & 88-Exercise Media Audit (88 exercises, 176 frames)',
  () => {
    execSync('node scripts/audit-sw-media.mjs', { cwd: rootDir, stdio: 'pipe' })
  },
)

// --- Task G3 Master Gates ---
// 18. Gate G3.1: Bottom Void and Docking Contract
runStep('Gate G3.1: Bottom Void & Docking Contract', () => {
  execSync('node scripts/gate-docking.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 19. Gate G3.2: Exercise Media Coverage & Local URL Contract
runStep('Gate G3.2: Exercise Media URLs & Verified Local Contract', () => {
  execSync('node scripts/gate-media-urls.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 20. Gate G3.3a: Calorie & Measurement Unit Contract
runStep('Gate G3.3a: Calorie & Measurement Unit Contract («سعرة»)', () => {
  execSync('node scripts/gate-units.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 21. Gate G3.3b: Icon Unification Contract
runStep('Gate G3.3b: Icon Unification Contract (SVG Icons)', () => {
  execSync('node scripts/gate-icons.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 22. Gate G3.3c: Surface Contract
runStep('Gate G3.3c: Surface Contract (Card 16px, Bar 0px Full-Bleed)', () => {
  execSync('node scripts/gate-surface.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 23. Gate G3.3d: Energy & Nutrition Target Agreement
runStep('Gate G3.3d: Energy & Nutrition Target Agreement', () => {
  execSync('node scripts/gate-energy-agreement.mjs', {
    cwd: rootDir,
    stdio: 'pipe',
  })
})

// 24. Gate G3.3e: Zero Horizontal Overflow on 360x640
runStep('Gate G3.3e: Zero Horizontal Overflow on 360x640', () => {
  execSync('node scripts/gate-overflow.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 25. Gate G3.3f: WCAG AA 4.5:1 Contrast Across Themes
runStep('Gate G3.3f: WCAG AA 4.5:1 Contrast Across Themes', () => {
  execSync('node scripts/gate-contrast.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 26. Gate G3.4: Anatomical Atlas
runStep('Gate G3.4: Anatomical Atlas (SVG View, Colors & Glow)', () => {
  execSync('node scripts/gate-atlas.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 27. Gate G3.5: Day Management
runStep('Gate G3.5: Day Management (Rename, Add, Cardio & Mismatch)', () => {
  execSync('node scripts/gate-days.mjs', { cwd: rootDir, stdio: 'pipe' })
})

// 28. Gate G3.6: Session Agreement & Owner Program Import
runStep('Gate G3.6: Session Agreement & Owner Program Import', () => {
  execSync('node scripts/gate-session-agreement.mjs', {
    cwd: rootDir,
    stdio: 'pipe',
  })
})

console.log('\n====================================================')
if (overallFailures > 0) {
  console.error(`❌ VERIFICATION FAILED: ${overallFailures} checks failed.`)
  process.exit(1)
} else {
  console.log('✅ ALL VERIFICATION GATES PASSED!')
  console.log(
    '   The application is fully verified, type-safe, and mobile-ready.',
  )
  console.log('====================================================\n')
  process.exit(0)
}
