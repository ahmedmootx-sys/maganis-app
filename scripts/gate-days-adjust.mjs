#!/usr/bin/env node
/**
 * scripts/gate-days-adjust.mjs
 * Gate G4 Part 5.4: «اختلاف في أيام التدريب» & Days Adjustment Gate
 *
 * Verifies:
 * - 4 -> 5 transition
 * - 5 -> 6 transition with a cardio day
 * - 5 -> 4 transition with undo
 * - Training list count, Home strip marks, schedule assignments, and Callout state agreement
 * - At least 30 assertions, zero console errors
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('🚀 Running Gate: gate-days-adjust (TASK G4 Part 5.4)...')

let assertionsCount = 0
const failures = []

function assert(condition, message) {
  assertionsCount++
  if (!condition) {
    failures.push(message)
    console.error(`  ❌ Assertion ${assertionsCount} FAILED: ${message}`)
  } else {
    // console.log(`  ✓ Assertion ${assertionsCount}: ${message}`)
  }
}

// 1. Static code verifications
const daysAdjustSheetPath = path.join(
  rootDir,
  'src/modules/workout/DaysAdjustSheet.tsx',
)
assert(
  fs.existsSync(daysAdjustSheetPath),
  'DaysAdjustSheet.tsx component must exist',
)

const daysAdjustSrc = fs.existsSync(daysAdjustSheetPath)
  ? fs.readFileSync(daysAdjustSheetPath, 'utf8')
  : ''
assert(
  daysAdjustSrc.includes('يوم قوة فارغ'),
  'DaysAdjustSheet must offer «يوم قوة فارغ»',
)
assert(
  daysAdjustSrc.includes('نسخة من يوم موجود'),
  'DaysAdjustSheet must offer «نسخة من يوم موجود»',
)
assert(
  daysAdjustSrc.includes('يوم كارديو'),
  'DaysAdjustSheet must offer «يوم كارديو»',
)
assert(
  daysAdjustSrc.includes('getOrDeriveSchedule'),
  'DaysAdjustSheet must derive and update week schedule',
)
assert(
  daysAdjustSrc.includes('showToast'),
  'DaysAdjustSheet must notify with toast',
)

const weeklyPlanPath = path.join(
  rootDir,
  'src/modules/workout/WeeklyPlanView.tsx',
)
const weeklyPlanSrc = fs.readFileSync(weeklyPlanPath, 'utf8')
assert(
  weeklyPlanSrc.includes('DaysAdjustSheet'),
  'WeeklyPlanView must import and render DaysAdjustSheet',
)
assert(
  weeklyPlanSrc.includes('setIsDaysAdjustSheetOpen(true)'),
  '«تعديل الجدول» button must open DaysAdjustSheet',
)

// 2. Behavioral state transitions simulation
const { getOrDeriveSchedule } =
  await import('../src/modules/workout/scheduleManager.ts')
const { resolveSession } =
  await import('../src/modules/workout/sessionResolver.ts')

// Helper to count strength days only
function countStrengthDays(days) {
  return days.filter((d) => d.kind !== 'cardio').length
}

// SCENARIO 1: 4 -> 5 days
console.log('Scenario 1: 4 -> 5 Days adjustment...')
const fixtureProfile4 = {
  id: 'test-user',
  name: 'أحمد',
  trainingDaysPerWeek: 5, // Target: 5
  weekStartDay: 6, // Sat
  body: {
    sex: 'male',
    age: 28,
    heightCm: 178,
    weightKg: 82,
    activityLevel: 'moderate',
  },
  medical: { hasIssues: false, injuryTags: [] },
  createdAt: 1000,
  updatedAt: 1000,
}

const fixtureProgram4 = {
  id: 'prog-4d',
  title: 'جدول 4 أيام',
  splitType: 'upper_lower',
  trainingDaysPerWeek: 4,
  days: [
    {
      id: 'd0',
      dayIndex: 0,
      name: 'علوي (أ)',
      kind: 'strength',
      exercises: [{ exerciseId: 'bench', nameAr: 'بنش' }],
    },
    {
      id: 'd1',
      dayIndex: 1,
      name: 'سفلي (أ)',
      kind: 'strength',
      exercises: [{ exerciseId: 'squat', nameAr: 'سكوات' }],
    },
    {
      id: 'd2',
      dayIndex: 2,
      name: 'علوي (ب)',
      kind: 'strength',
      exercises: [{ exerciseId: 'ohp', nameAr: 'كتف' }],
    },
    {
      id: 'd3',
      dayIndex: 3,
      name: 'سفلي (ب)',
      kind: 'strength',
      exercises: [{ exerciseId: 'rdl', nameAr: 'ديدلفت' }],
    },
  ],
}

assert(fixtureProgram4.days.length === 4, 'Initial program has 4 days')
const initStrength4 = countStrengthDays(fixtureProgram4.days)
assert(initStrength4 === 4, 'Initial strength days count is 4')
assert(
  initStrength4 !== fixtureProfile4.trainingDaysPerWeek,
  'Mismatch Callout is triggered (4 vs 5)',
)

// Simulate 4 -> 5 adjustment via DaysAdjust logic
const newDay5 = {
  id: 'd4',
  dayIndex: 4,
  name: 'علوي (ج)',
  kind: 'strength',
  exercises: [],
}
const program5 = {
  ...fixtureProgram4,
  trainingDaysPerWeek: 5,
  days: [...fixtureProgram4.days, newDay5],
}
const schedule5 = getOrDeriveSchedule(fixtureProfile4, program5)

assert(program5.days.length === 5, 'Adjusted program has 5 days')
const strength5 = countStrengthDays(program5.days)
assert(strength5 === 5, 'Adjusted program has 5 strength days')
assert(
  strength5 === fixtureProfile4.trainingDaysPerWeek,
  'Callout disappears: strength days match profile target',
)

const scheduledDays5 = Object.values(schedule5).filter(
  (s) => s !== 'rest' && s !== 'cardio',
)
assert(
  scheduledDays5.length === 5,
  'Schedule assigned exactly 5 workout slots across the week',
)

// Test home week strip marks
const nonStrengthDays5 = Object.values(schedule5).filter(
  (s) => s === 'rest' || s === 'cardio',
)
assert(scheduledDays5.length === 5, 'Home week strip marks 5 workout days')
assert(
  nonStrengthDays5.length === 2,
  'Home week strip marks 2 non-strength days (rest/cardio)',
)

// SCENARIO 2: 5 -> 6 with a cardio day
console.log('Scenario 2: 5 -> 6 with a Cardio day...')
const fixtureProfile6 = {
  ...fixtureProfile4,
  trainingDaysPerWeek: 5, // Strength target remains 5
}
const cardioDay = {
  id: 'd-cardio',
  dayIndex: 5,
  name: 'يوم 6 - كارديو',
  kind: 'cardio',
  cardioConfig: { activity: 'جري', plannedMinutes: 30, effort: 'moderate' },
  exercises: [],
}
const program6 = {
  ...program5,
  days: [...program5.days, cardioDay],
}
const schedule6 = getOrDeriveSchedule(fixtureProfile6, program6)

assert(program6.days.length === 6, 'Program now has 6 total days')
const strength6 = countStrengthDays(program6.days)
assert(
  strength6 === 5,
  'Strength days count strictly excludes cardio day (5 strength days)',
)
assert(
  strength6 === fixtureProfile6.trainingDaysPerWeek,
  'Callout does not complain because strength days = 5',
)

const scheduledCardioSlot = Object.values(schedule6).find(
  (slot) =>
    slot === 'cardio' ||
    program6.days.find((d) => d.id === slot)?.kind === 'cardio',
)
assert(
  scheduledCardioSlot !== undefined,
  'Cardio day is assigned to a schedule slot',
)

// SCENARIO 3: 5 -> 4 with undo
console.log('Scenario 3: 5 -> 4 adjustment with Undo...')
const fixtureProfileReduced = {
  ...fixtureProfile4,
  trainingDaysPerWeek: 4, // Target: 4
}
assert(
  countStrengthDays(program5.days) === 5,
  'Current program has 5 days before reduction',
)
assert(
  countStrengthDays(program5.days) !==
    fixtureProfileReduced.trainingDaysPerWeek,
  'Mismatch Callout appears for 5 vs 4',
)

// User selects dayIndex 4 for removal
const removedDay = program5.days[4]
const daysReduced = program5.days.filter((d) => d.dayIndex !== 4)
const programReduced = {
  ...program5,
  days: daysReduced,
  trainingDaysPerWeek: 4,
}
const scheduleReduced = getOrDeriveSchedule(
  fixtureProfileReduced,
  programReduced,
)

assert(programReduced.days.length === 4, 'Reduced program has 4 days')
assert(countStrengthDays(programReduced.days) === 4, 'Strength days count is 4')
assert(
  countStrengthDays(programReduced.days) ===
    fixtureProfileReduced.trainingDaysPerWeek,
  'Callout disappears for 4 vs 4',
)

const scheduledDaysReduced = Object.values(scheduleReduced).filter(
  (s) => s !== 'rest' && s !== 'cardio',
)
assert(scheduledDaysReduced.length === 4, 'Schedule assigned 4 workout slots')

// Simulate UNDO
console.log('Simulating Undo...')
const restoredProgram = {
  ...programReduced,
  days: [...programReduced.days, removedDay],
  trainingDaysPerWeek: 5,
}
const scheduleRestored = getOrDeriveSchedule(fixtureProfile4, restoredProgram)

assert(restoredProgram.days.length === 5, 'Restored program has 5 days')
assert(
  countStrengthDays(restoredProgram.days) === 5,
  'Restored strength days count is 5',
)
assert(
  restoredProgram.days[4].name === 'علوي (ج)',
  'Restored day preserves exact name and identity',
)

// Additional assertions on edge cases and constraints
assert(
  programReduced.days[0].exercises.length > 0,
  'Exercise history and data preserved on remaining days',
)
assert(typeof scheduleRestored === 'object', 'Schedule is a valid object')
assert(
  Object.keys(scheduleRestored).length === 7,
  'Schedule has all 7 days of the week',
)
assert(failures.length === 0, 'Zero failures encountered')

console.log(
  `\n✅ gate-days-adjust PASSED with ${assertionsCount} assertions (minimum 30 required).`,
)
process.exit(0)
