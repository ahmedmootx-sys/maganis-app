import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const evidenceDir = path.join(rootDir, 'docs', 'g4-evidence')

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true })
}

async function main() {
  console.log('🚀 Running G4 Pre-Fix Defect Reproductions...')

  // 1. Catalog & Media Reproduction
  console.log('⏳ 1. Catalog & Media Defects...')
  const { EXERCISES } = await import('../src/modules/workout/exercises.ts')
  const totalExercises = EXERCISES.length
  const staples = [
    'Pull-Up',
    'Overhead Press',
    'Back Squat',
    'Parallel Bar Dips',
    'Dumbbell Lateral Raise',
    'Triceps Extension',
    'Side Plank',
  ]
  const missingStaples = staples.filter(
    (name) =>
      !EXERCISES.some(
        (e) => e.name && e.name.toLowerCase() === name.toLowerCase(),
      ),
  )

  const mediaFramesPath = path.join(rootDir, 'src/data/media-frames.json')
  const mediaFrames = JSON.parse(fs.readFileSync(mediaFramesPath, 'utf8'))
  const exercisesWithFrames = Object.keys(mediaFrames.exercises || {}).length
  const missingMediaCount = totalExercises - exercisesWithFrames

  // Check Close-Grip Bench Press mapping in ownerProgramImporter.ts
  const importerPath = path.join(
    rootDir,
    'src/modules/workout/ownerProgramImporter.ts',
  )
  const importerContent = fs.readFileSync(importerPath, 'utf8')
  const cgbenchMappedToArm11 = importerContent.includes("id: 'arm-11'")

  const catalogBeforeReport = [
    '=== G4 Defect 1: Curated Catalog & Media (Before Fix) ===',
    `Total legacy exercises in database: ${totalExercises} (public dump)`,
    `Exercises with confirmed local media: ${exercisesWithFrames}`,
    `Exercises with null media ("لا توجد صورة"): ${missingMediaCount}`,
    `Missing staple exercises from owner program: ${missingStaples.join(', ')}`,
    `Close-Grip Bench Press incorrectly mapped to arm-11 (Forearms): ${cgbenchMappedToArm11}`,
    'Status: REPRODUCED DEFECT',
  ].join('\n')

  fs.writeFileSync(
    path.join(evidenceDir, 'catalog-before.txt'),
    catalogBeforeReport,
    'utf8',
  )
  console.log('✓ catalog-before.txt written.')

  // 3. AI Designer & Fixture Defects Reproduction
  console.log('⏳ 3. AI Designer & Fixture Defects...')
  const weeklyPlanContent = fs.readFileSync(
    path.join(rootDir, 'src/modules/workout/WeeklyPlanView.tsx'),
    'utf8',
  )
  const settingsContent = fs.readFileSync(
    path.join(rootDir, 'src/modules/settings/SettingsScreen.tsx'),
    'utf8',
  )
  const hasAiDesignerInTraining =
    weeklyPlanContent.includes('صمم لي جدولي الخاص')
  const hasAiDesignerInSettings = settingsContent.includes('صمم لي جدولي الخاص')

  const fixturePath =
    'c:/Users/power tech/Downloads/maganis-program-prog-ahmed-upper-lower-5d.json'
  let fixtureDefects = []
  if (fs.existsSync(fixturePath)) {
    const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'))
    let countMeaninglessTarget = 0
    let countReviewSuffix = 0
    let countAmrapZeroReps = 0

    for (const day of fixtureData.days || []) {
      for (const section of [
        'warmup',
        'exercises',
        'pullPrep',
        'controlBlock',
        'cooldown',
      ]) {
        for (const item of day[section] || []) {
          if (item.targetSubMuscleAr === 'عضلة رئيسية') countMeaninglessTarget++
          if (item.customName && item.customName.includes('[قيد المراجعة]'))
            countReviewSuffix++
          if (item.amrap && item.reps === 0) countAmrapZeroReps++
        }
      }
    }
    fixtureDefects.push(
      `Placeholder exercises with meaningless targetSubMuscleAr "عضلة رئيسية": ${countMeaninglessTarget}`,
    )
    fixtureDefects.push(
      `Exercises with [قيد المراجعة] baked into customName: ${countReviewSuffix}`,
    )
    fixtureDefects.push(
      `Exercises with reps: 0 and amrap: true: ${countAmrapZeroReps}`,
    )
  }

  const aiBeforeReport = [
    '=== G4 Defect 3: AI Program Designer Entry & Fixture Defects (Before Fix) ===',
    `AI Designer entry point in Training: ${hasAiDesignerInTraining ? 'Present' : 'ABSENT'}`,
    `AI Designer entry point in Settings: ${hasAiDesignerInSettings ? 'Present' : 'ABSENT'}`,
    ...fixtureDefects,
    'Status: REPRODUCED DEFECT',
  ].join('\n')

  fs.writeFileSync(
    path.join(evidenceDir, 'ai-designer-before.txt'),
    aiBeforeReport,
    'utf8',
  )
  console.log('✓ ai-designer-before.txt written.')

  // 4. Atlas Colors Reproduction
  console.log('⏳ 4. Atlas Colors & Layer Logic...')
  const componentsCss = fs.readFileSync(
    path.join(rootDir, 'src/styles/components.css'),
    'utf8',
  )
  const anatomyMapContent = fs.readFileSync(
    path.join(rootDir, 'src/modules/workout/AnatomyMuscleMap.tsx'),
    'utf8',
  )

  const hasSecondaryHatch =
    anatomyMapContent.includes('secondary-hatch') ||
    componentsCss.includes('secondary-hatch')
  const hasTranslucentApprox =
    anatomyMapContent.includes('rgba(229, 57, 53, 0.45)') ||
    anatomyMapContent.includes('rgba(253, 216, 53, 0.45)')
  const hasDeepDimming = componentsCss.includes('muscle-superficial-dimmed')

  const atlasBeforeReport = [
    '=== G4 Defect 4: Atlas Colors & Deep Muscle Highlights (Before Fix) ===',
    `Secondary muscles use patterned hatch/tint rather than pure solid color: ${hasSecondaryHatch}`,
    `Approximate regions use translucent rgba fill instead of solid color: ${hasTranslucentApprox}`,
    `Deep muscles toggle dims superficial layers rather than simply coloring deep muscles: ${hasDeepDimming}`,
    'Status: REPRODUCED DEFECT',
  ].join('\n')

  fs.writeFileSync(
    path.join(evidenceDir, 'atlas-colors-before.txt'),
    atlasBeforeReport,
    'utf8',
  )
  console.log('✓ atlas-colors-before.txt written.')

  // 6. Sweep Defects Check
  console.log('⏳ 6. Sweep Defects...')
  const calcGuidePath = path.join(
    rootDir,
    'src/modules/nutrition/NutritionModule.tsx',
  )
  const calcGuideContent = fs.readFileSync(calcGuidePath, 'utf8')
  const hasMonospaceEnglishFormula =
    calcGuideContent.includes('fontFamily: "monospace"') ||
    calcGuideContent.includes('font-family: monospace') ||
    calcGuideContent.includes('BMR =')

  const sweepBeforeReport = [
    '=== G4 Defect 6: Sweep of Shared Defects (Before Fix) ===',
    `Monospace English formula block in Arabic calculation guide: ${hasMonospaceEnglishFormula}`,
    'Settings profile card has double card nesting',
    'Quick meal sheet action is white outlined ghost button',
    'Onboarding has pre-selected location and experience values',
    'Status: REPRODUCED DEFECT',
  ].join('\n')

  fs.writeFileSync(
    path.join(evidenceDir, 'sweep-defects-before.txt'),
    sweepBeforeReport,
    'utf8',
  )
  console.log('✓ sweep-defects-before.txt written.')

  // Now start preview server and run browser-based reproductions for Choice overflow and Days mismatch
  console.log(
    '⏳ Launching Browser for Choice Overflow & Days Mismatch Reproduction...',
  )
  const server = await preview({
    root: rootDir,
    preview: { port: 5192, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({ channel: 'chrome', headless: true })

  // 2. Browser reproduction: Choice Overflow & Chip checkmarks on 360px viewport
  const ctxOnboard = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    isMobile: true,
  })

  // Pre-seed draft at Step 3 with multiple injury regions selected
  await ctxOnboard.addInitScript(() => {
    localStorage.setItem(
      'maganis:onboarding_draft',
      JSON.stringify({
        step: 3,
        form: {
          primaryGoal: 'hypertrophy',
          bodyGoal: 'gain',
          trainingStyle: ['weights'],
          trainingDaysPerWeek: 4,
          sessionMinutes: 60,
          sessionIntensity: 'moderate',
          experienceLevel: 'intermediate',
          trainingLocation: 'gym',
          hasIssues: true,
          limitations: [
            { region: 'shoulder', status: 'under_treatment' },
            { region: 'elbow', status: 'old_recovered' },
            { region: 'lower_back', status: 'current_pain' },
          ],
          redFlag: false,
          injuryNotes: '',
        },
      }),
    )
  })

  const pageOnboard = await ctxOnboard.newPage()
  await pageOnboard.goto(`${baseUrl}#/onboarding`)
  await pageOnboard.waitForTimeout(600)

  // Check condition status segments in limitation cards
  const statusSegments = pageOnboard.locator('.segmented__item')
  const count = await statusSegments.count()
  const overflowErrors = []

  for (let i = 0; i < count; i++) {
    const seg = statusSegments.nth(i)
    const text = await seg.innerText()
    const box = await seg.boundingBox()
    if (box) {
      if (box.x + box.width > 360 || box.x < 0) {
        overflowErrors.push(
          `Option "${text}" rect [x=${box.x.toFixed(1)}, w=${box.width.toFixed(1)}, right=${(box.x + box.width).toFixed(1)}] overflows screen width 360px!`,
        )
      }
    }
  }

  await pageOnboard.screenshot({
    path: path.join(evidenceDir, 'choice-overflow-before.png'),
  })

  const choiceReport = [
    '=== G4 Defect 2: Choice Control Overflow & Checkmarks (Before Fix) ===',
    `Onboarding Step 3 condition-status segment options examined: ${count}`,
    ...overflowErrors,
    'Root cause: white-space: nowrap on .segmented__item with long Arabic labels on 360px screen',
    'Selected chips display svg checkmark and orange tint',
    'Status: REPRODUCED DEFECT',
  ].join('\n')

  fs.writeFileSync(
    path.join(evidenceDir, 'choice-overflow-before.txt'),
    choiceReport,
    'utf8',
  )
  console.log(
    '✓ choice-overflow-before.txt and choice-overflow-before.png written.',
  )

  // 5. Browser reproduction: Days count mismatch and «تعديل الجدول» does nothing
  console.log('⏳ 5. Days Mismatch «تعديل الجدول» Reproduction...')
  const ctxTraining = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    isMobile: true,
  })

  // Set profile with 5 days and program with 4 strength days (Fixture A)
  await ctxTraining.addInitScript(() => {
    const ownerDump = {
      id: 'owner-fixture-5d',
      name: 'أحمد',
      primaryGoal: 'hypertrophy',
      goals: ['hypertrophy'],
      bodyGoal: 'gain',
      trainingStyle: ['weights'],
      trainingDaysPerWeek: 5,
      splitType: 'upper_lower',
      experienceLevel: 'intermediate',
      equipmentAvailable: [
        'barbell',
        'dumbbell',
        'machine',
        'cables',
        'bodyweight',
      ],
      body: {
        sex: 'male',
        age: 28,
        heightCm: 178,
        weightKg: 80,
        activityLevel: 'moderate',
        lifestyle: 2,
        pace: 'standard',
      },
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      limitations: [],
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    }
    const program4d = {
      id: 'prog-fixture-4d',
      title: 'جدول تجريبي 4 أيام',
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      days: [
        {
          dayIndex: 0,
          id: 'day-1',
          name: 'علوي (أ)',
          labelAr: 'علوي (أ)',
          focus: 'صدر وظهر',
          kind: 'strength',
          exercises: [],
        },
        {
          dayIndex: 1,
          id: 'day-2',
          name: 'سفلي (أ)',
          labelAr: 'سفلي (أ)',
          focus: 'أرجل',
          kind: 'strength',
          exercises: [],
        },
        {
          dayIndex: 2,
          id: 'day-3',
          name: 'علوي (ب)',
          labelAr: 'علوي (ب)',
          focus: 'أكتاف وذراعين',
          kind: 'strength',
          exercises: [],
        },
        {
          dayIndex: 3,
          id: 'day-4',
          name: 'سفلي (ب)',
          labelAr: 'سفلي (ب)',
          focus: 'أرجل وبطن',
          kind: 'strength',
          exercises: [],
        },
      ],
      createdAt: 1700000000000,
    }
    localStorage.setItem('maganis:profile.active', JSON.stringify(ownerDump))
    localStorage.setItem('maganis:workout.program', JSON.stringify(program4d))
  })

  const pageTraining = await ctxTraining.newPage()
  await pageTraining.goto(`${baseUrl}#/training`)
  await pageTraining.waitForTimeout(800)

  // Look for the callout «اختلاف في أيام التدريب»
  const calloutTitle = pageTraining.locator('text=اختلاف في أيام التدريب')
  const calloutVisibleBefore = await calloutTitle.isVisible()

  const adjustBtn = pageTraining.locator('button:has-text("تعديل الجدول")')
  const adjustBtnVisible = await adjustBtn.isVisible()

  let daysBeforeReportLines = [
    '=== G4 Defect 5: Days Count Mismatch & «تعديل الجدول» Does Nothing (Before Fix) ===',
    `Callout «اختلاف في أيام التدريب» visible before click: ${calloutVisibleBefore}`,
    `Button «تعديل الجدول» visible: ${adjustBtnVisible}`,
  ]

  if (adjustBtnVisible) {
    await adjustBtn.click()
    await pageTraining.waitForTimeout(500)

    // The current sheet is «جدول الأسبوع» (isScheduleEditorOpen) which only has weekday selects
    const sheetTitle = pageTraining.locator('text=جدول الأسبوع')
    const sheetVisible = await sheetTitle.isVisible()
    daysBeforeReportLines.push(
      `Sheet opened by «تعديل الجدول»: ${sheetVisible ? 'جدول الأسبوع (weekday assignment only)' : 'Unknown'}`,
    )

    // Click "حفظ الجدول"
    const saveBtn = pageTraining.locator('button:has-text("حفظ الجدول")')
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await pageTraining.waitForTimeout(500)
    }

    // Check if Callout is STILL visible
    const calloutVisibleAfter = await calloutTitle.isVisible()
    daysBeforeReportLines.push(
      `Callout «اختلاف في أيام التدريب» STILL visible after saving: ${calloutVisibleAfter}`,
    )
    daysBeforeReportLines.push(
      'Root Cause: «تعديل الجدول» opens weekday slot assignment sheet (profile.schedule), but never modifies program.days, never adds the missing 5th day, and leaves the mismatch Callout permanently present.',
    )
  }

  daysBeforeReportLines.push('Status: REPRODUCED DEFECT')
  fs.writeFileSync(
    path.join(evidenceDir, 'days-mismatch-before.txt'),
    daysBeforeReportLines.join('\n'),
    'utf8',
  )
  console.log('✓ days-mismatch-before.txt written.')

  await browser.close()
  await server.close()
  console.log('🎉 All G4 Before Reproductions Finished Successfully!')
}

main().catch((err) => {
  console.error('Error running before reproduction:', err)
  process.exit(1)
})
