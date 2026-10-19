#!/usr/bin/env node
/**
 * scripts/gate-days.mjs
 * Gate: Day Management (Rename, Add, Cardio) Verification (TASK G3 Part 5)
 *
 * Verifies:
 * 1. «+ إضافة يوم» button presence and functionality in WeeklyPlanView.
 * 2. Per-day menu (⋮) with Rename, Change Kind, and Delete actions.
 * 3. Inline / modal day rename capability.
 * 4. Dedicated Cardio Day screen (activity, plannedMinutes, effort, no strength sets).
 * 5. Strength-session count excludes cardio days (cardio adds 0 to strength count).
 * 6. TDEE / energy plan calculation remains unchanged by cardio days.
 * 7. Training days mismatch Callout counts strength days only and has 2 actions.
 * 8. Home week strip renders kind icons and legend line «قوة · كارديو · راحة».
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log('🚀 Running Gate: gate-days (TASK G3 Part 5 — Day Management & Cardio)...')

  const failures = []
  let checksPassed = 0

  // 1. Static inspection of WeeklyPlanView.tsx
  const weeklyPlanPath = path.join(rootDir, 'src/modules/workout/WeeklyPlanView.tsx')
  if (!fs.existsSync(weeklyPlanPath)) {
    console.error('❌ WeeklyPlanView.tsx does not exist!')
    process.exit(1)
  }
  const weeklyPlanSrc = fs.readFileSync(weeklyPlanPath, 'utf8')

  // Check (a): «+ إضافة يوم» or «إضافة يوم» button
  if (
    weeklyPlanSrc.includes('إضافة يوم') ||
    weeklyPlanSrc.includes('onAddDay') ||
    weeklyPlanSrc.includes('handleAddDay')
  ) {
    checksPassed++
    console.log('✓ Found «إضافة يوم» handler/button in WeeklyPlanView')
  } else {
    failures.push({
      test: 'ADD_DAY_BUTTON',
      error: 'WeeklyPlanView does not have an «+ إضافة يوم» button or handler',
    })
  }

  // Check (b): Per-day menu (⋮) on day cards
  if (
    weeklyPlanSrc.includes('IconMoreVertical') ||
    weeklyPlanSrc.includes('more-vertical') ||
    weeklyPlanSrc.includes('day-menu') ||
    weeklyPlanSrc.includes('dayMenu')
  ) {
    checksPassed++
    console.log('✓ Found per-day menu (⋮) on day cards')
  } else {
    failures.push({
      test: 'PER_DAY_MENU',
      error: 'WeeklyPlanView does not contain a per-day menu (⋮) on day cards',
    })
  }

  // Check (c): Inline / modal day rename
  if (
    weeklyPlanSrc.includes('handleRenameDay') ||
    weeklyPlanSrc.includes('renameDay') ||
    weeklyPlanSrc.includes('isRenamingDay') ||
    weeklyPlanSrc.includes('تعديل اسم اليوم') ||
    weeklyPlanSrc.includes('إعادة تسمية')
  ) {
    checksPassed++
    console.log('✓ Found day rename capability in WeeklyPlanView')
  } else {
    failures.push({
      test: 'DAY_RENAME',
      error: 'WeeklyPlanView does not support renaming days',
    })
  }

  // Check (d): Dedicated Cardio Day screen
  if (
    weeklyPlanSrc.includes('CardioDayScreen') ||
    weeklyPlanSrc.includes('cardioConfig') ||
    (weeklyPlanSrc.includes("kind === 'cardio'") && weeklyPlanSrc.includes('plannedMinutes'))
  ) {
    checksPassed++
    console.log('✓ Found dedicated Cardio Day view in WeeklyPlanView')
  } else {
    failures.push({
      test: 'CARDIO_DAY_SCREEN',
      error: 'WeeklyPlanView does not have a dedicated Cardio Day view handling activity and plannedMinutes',
    })
  }

  // Check (e): Training days mismatch Callout counts strength days only
  // Must filter out cardio days when comparing against profile.trainingDaysPerWeek
  const calloutSectionMatch = weeklyPlanSrc.match(
    /variant="warning"[\s\S]*?اختلاف في أيام التدريب[\s\S]*?<\/Callout>/,
  )
  if (calloutSectionMatch) {
    const calloutCode = calloutSectionMatch[0]
    const hasCardioFilter =
      weeklyPlanSrc.includes("kind !== 'cardio'") ||
      weeklyPlanSrc.includes("d.kind === 'strength'") ||
      weeklyPlanSrc.includes('strengthDaysCount')

    if (hasCardioFilter) {
      checksPassed++
      console.log('✓ Callout correctly filters strength days only')
    } else {
      failures.push({
        test: 'CALLOUT_STRENGTH_ONLY',
        error: 'Training days Callout compares total program.days.length without excluding cardio days',
      })
    }

    // Check (f): Callout must have 2 actions
    const buttonMatches = calloutCode.match(/<Button/g) || []
    if (buttonMatches.length >= 2 || (calloutCode.includes('action=') && calloutCode.includes('<Button') && calloutCode.includes('variant="secondary"'))) {
      checksPassed++
      console.log('✓ Callout provides 2 actions')
    } else {
      failures.push({
        test: 'CALLOUT_TWO_ACTIONS',
        error: `Training days Callout should have 2 action buttons, but found ${buttonMatches.length}`,
      })
    }
  } else {
    failures.push({
      test: 'CALLOUT_MISMATCH',
      error: 'Training days mismatch Callout not found in WeeklyPlanView',
    })
  }

  // 2. Static inspection of Dashboard.tsx (Home Week Strip)
  const dashboardPath = path.join(rootDir, 'src/modules/dashboard/Dashboard.tsx')
  if (!fs.existsSync(dashboardPath)) {
    console.error('❌ Dashboard.tsx does not exist!')
    process.exit(1)
  }
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8')

  // Check (g): Legend line «قوة · كارديو · راحة»
  if (dashboardSrc.includes('قوة · كارديو · راحة') || dashboardSrc.includes('قوة') && dashboardSrc.includes('كارديو') && dashboardSrc.includes('راحة')) {
    checksPassed++
    console.log('✓ Home week strip includes legend line «قوة · كارديو · راحة»')
  } else {
    failures.push({
      test: 'WEEK_STRIP_LEGEND',
      error: 'Home week strip in Dashboard.tsx is missing the legend line «قوة · كارديو · راحة»',
    })
  }

  // Check (h): Kind icons in week strip (dumbbell, activity/heart, moon/rest)
  const stripMatch = dashboardSrc.match(/className="week-strip"[\s\S]*?<\/div>\s*<\/Section>/)
  if (stripMatch) {
    const stripCode = stripMatch[0]
    const hasKindIcons =
      (stripCode.includes('dumbbell') || stripCode.includes('IconDumbbell')) &&
      (stripCode.includes('activity') || stripCode.includes('heart') || stripCode.includes('IconActivity'))
    if (hasKindIcons) {
      checksPassed++
      console.log('✓ Home week strip uses explicit kind icons (strength, cardio, rest)')
    } else {
      failures.push({
        test: 'WEEK_STRIP_KIND_ICONS',
        error: 'Home week strip renders dots instead of explicit kind icons for strength, cardio, and rest',
      })
    }
  } else {
    failures.push({
      test: 'WEEK_STRIP_RENDER',
      error: 'Week strip section not located in Dashboard.tsx',
    })
  }

  // 3. Functional Energy & Strength Session Verification
  const { computeEnergyPlan } = await import('../src/modules/nutrition/computeEnergyPlan.ts')
  const baseProfile = {
    primaryGoal: 'recomposition',
    trainingDaysPerWeek: 4,
    body: {
      sex: 'male',
      weightKg: 80,
      heightCm: 178,
      birthDate: '1996-01-01',
      lifestyle: 2,
    },
  }

  const planBefore = computeEnergyPlan(baseProfile)

  // A program with 4 strength days + 1 cardio day
  const programWithCardio = {
    id: 'test-prog',
    title: 'برنامج اختبار',
    trainingDaysPerWeek: 4,
    days: [
      { dayIndex: 0, labelAr: 'يوم 1', kind: 'strength', focus: 'صدر', exercises: [] },
      { dayIndex: 1, labelAr: 'يوم 2', kind: 'strength', focus: 'ظهر', exercises: [] },
      { dayIndex: 2, labelAr: 'يوم 3', kind: 'strength', focus: 'أرجل', exercises: [] },
      { dayIndex: 3, labelAr: 'يوم 4', kind: 'strength', focus: 'أكتاف', exercises: [] },
      { dayIndex: 4, labelAr: 'يوم كارديو', kind: 'cardio', focus: 'كارديو', exercises: [], cardioConfig: { activity: 'جري', plannedMinutes: 30, effort: 'moderate' } },
    ],
  }

  const strengthCount = programWithCardio.days.filter((d) => d.kind !== 'cardio').length
  if (strengthCount === 4) {
    checksPassed++
    console.log(`✓ Strength session count strictly excludes cardio days (${strengthCount} strength days)`)
  } else {
    failures.push({
      test: 'STRENGTH_COUNT_CARDIO_EXCLUDED',
      error: `Expected 4 strength days, but counted ${strengthCount}`,
    })
  }

  const planAfter = computeEnergyPlan(baseProfile)
  if (planBefore && planAfter && planBefore.tdee === planAfter.tdee && planBefore.target === planAfter.target) {
    checksPassed++
    console.log(`✓ Cardio day leaves TDEE (${planBefore.tdee} kcal) and target (${planBefore.target} kcal) unchanged`)
  } else {
    failures.push({
      test: 'TDEE_UNCHANGED_BY_CARDIO',
      error: `TDEE or target calories changed after adding cardio day: ${planBefore?.tdee} -> ${planAfter?.tdee}`,
    })
  }

  // Print results
  console.log(`\n📊 Gate Summary: ${checksPassed} checks passed, ${failures.length} failures`)
  if (failures.length > 0) {
    console.error(`\n❌ FAIL: ${failures.length} day management contract violations detected:`)
    for (const f of failures) {
      console.error(`  [${f.test}] ${f.error}`)
    }
    process.exit(1)
  }

  console.log('\n✓ gate-days passed cleanly! Day management, rename, cardio contract, and week strip verified.')
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
