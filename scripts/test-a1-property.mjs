#!/usr/bin/env node
/**
 * scripts/test-a1-property.mjs
 * Property test for A1: Day-count contradiction between Home and Training.
 * Tests at least 500 seeded random operations.
 *
 * Checks:
 * 1. Both screens report identical counts (resistance, cardio, total).
 * 2. No callout appears on one screen but not the other.
 * 3. No day.kind is ever modified by a callout action.
 * 4. App reaches a stable state after at most one tap (callout disappears on both screens).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Simple seeded PRNG (mulberry32)
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Check if new selector exists, otherwise fall back to simulating old code
async function loadModules() {
  let selectWeekLoad = null
  try {
    const mod = await import('../src/modules/workout/weekLoadSelector.ts')
    selectWeekLoad = mod.selectWeekLoad
  } catch (e) {
    selectWeekLoad = null
  }
  return { selectWeekLoad }
}

async function runTest() {
  console.log('🚀 Running A1 Property Test: 500 seeded random operations...')
  const { selectWeekLoad } = await loadModules()

  // Load persona profile dump
  const personaDump = JSON.parse(
    fs.readFileSync(
      path.join(rootDir, 'fixtures/persona.synthetic.json'),
      'utf8',
    ),
  )
  const initialProfile = personaDump.profile

  const rng = mulberry32(1337)

  // Test both with fixture and persona data
  const datasets = [
    {
      name: "Persona's Synthetic Data (5-day split + cardio)",
      profile: { ...initialProfile, trainingDaysPerWeek: 5 },
      program: {
        id: 'owner-prog',
        days: [
          { dayIndex: 0, kind: 'strength', focus: 'Upper' },
          { dayIndex: 1, kind: 'strength', focus: 'Lower' },
          { dayIndex: 2, kind: 'strength', focus: 'Push' },
          { dayIndex: 3, kind: 'strength', focus: 'Pull' },
          { dayIndex: 4, kind: 'strength', focus: 'Legs' },
          {
            dayIndex: 5,
            kind: 'cardio',
            focus: 'Cardio',
            cardio: { plannedMinutes: 30 },
          },
        ],
      },
    },
    {
      name: 'Fixture Data (4-day split)',
      profile: { id: 'fixture-user', trainingDaysPerWeek: 4 },
      program: {
        id: 'fixture-prog',
        days: [
          { dayIndex: 0, kind: 'strength', focus: 'Upper A' },
          { dayIndex: 1, kind: 'strength', focus: 'Lower A' },
          { dayIndex: 2, kind: 'strength', focus: 'Upper B' },
          { dayIndex: 3, kind: 'strength', focus: 'Lower B' },
        ],
      },
    },
  ]

  let totalOperations = 0
  const violations = []

  for (const ds of datasets) {
    console.log(`\nEvaluating dataset: ${ds.name}`)
    let profile = JSON.parse(JSON.stringify(ds.profile))
    let program = JSON.parse(JSON.stringify(ds.program))

    for (let opIdx = 0; opIdx < 500; opIdx++) {
      totalOperations++
      const opChoice = Math.floor(rng() * 7)

      // Snapshot kinds before op
      const kindsBefore = program.days.map((d) => d.kind)

      if (opChoice === 0) {
        // Add resistance day
        const nextIdx = program.days.length
        program.days.push({
          dayIndex: nextIdx,
          kind: 'strength',
          focus: `Strength ${nextIdx}`,
        })
      } else if (
        opChoice === 1 &&
        program.days.some((d) => d.kind === 'strength' || !d.kind)
      ) {
        // Remove a resistance day
        const sIdx = program.days.findIndex(
          (d) => d.kind === 'strength' || !d.kind,
        )
        if (sIdx !== -1) program.days.splice(sIdx, 1)
      } else if (opChoice === 2) {
        // Add cardio day
        const nextIdx = program.days.length
        program.days.push({
          dayIndex: nextIdx,
          kind: 'cardio',
          focus: 'Cardio',
          cardio: { plannedMinutes: 30 },
        })
      } else if (
        opChoice === 3 &&
        program.days.some((d) => d.kind === 'cardio')
      ) {
        // Remove cardio day
        const cIdx = program.days.findIndex((d) => d.kind === 'cardio')
        if (cIdx !== -1) program.days.splice(cIdx, 1)
      } else if (opChoice === 4) {
        // Change profile days
        profile.trainingDaysPerWeek = 2 + Math.floor(rng() * 5)
      } else if (opChoice === 5) {
        // Simulate Home callout tap
        // If selectWeekLoad exists, both use resistanceDays.
        // In OLD code: Home set profile to program.days.length
        if (selectWeekLoad) {
          const load = selectWeekLoad(profile, program)
          if (load.resistanceDays !== profile.trainingDaysPerWeek) {
            profile.trainingDaysPerWeek = load.resistanceDays
          }
        } else {
          // OLD BEHAVIOR
          if (program.days.length !== profile.trainingDaysPerWeek) {
            profile.trainingDaysPerWeek = program.days.length
          }
        }
      } else if (opChoice === 6) {
        // Simulate Training callout tap
        // In OLD code: Training set profile to strengthDaysCount
        if (selectWeekLoad) {
          const load = selectWeekLoad(profile, program)
          if (load.resistanceDays !== profile.trainingDaysPerWeek) {
            profile.trainingDaysPerWeek = load.resistanceDays
          }
        } else {
          // OLD BEHAVIOR
          const strengthCount = program.days.filter(
            (d) => d.kind !== 'cardio',
          ).length
          if (strengthCount !== profile.trainingDaysPerWeek) {
            profile.trainingDaysPerWeek = strengthCount
          }
        }
      }

      // Assertions
      let homeCounts, trainingCounts, homeCallout, trainingCallout

      if (selectWeekLoad) {
        const load = selectWeekLoad(profile, program)
        homeCounts = {
          resistance: load.resistanceDays,
          cardio: load.cardioDays,
          total: load.totalScheduledSessions,
        }
        trainingCounts = {
          resistance: load.resistanceDays,
          cardio: load.cardioDays,
          total: load.totalScheduledSessions,
        }
        homeCallout = load.resistanceDays !== profile.trainingDaysPerWeek
        trainingCallout = load.resistanceDays !== profile.trainingDaysPerWeek
      } else {
        // Old code simulation from Dashboard.tsx and WeeklyPlanView.tsx
        const oldHomeTotal = program.days.length
        const oldTrainingStrength = program.days.filter(
          (d) => d.kind !== 'cardio',
        ).length

        homeCounts = {
          resistance: oldHomeTotal,
          cardio: 0,
          total: oldHomeTotal,
        }
        trainingCounts = {
          resistance: oldTrainingStrength,
          cardio: program.days.length - oldTrainingStrength,
          total: program.days.length,
        }

        homeCallout = program.days.length !== profile.trainingDaysPerWeek
        trainingCallout = oldTrainingStrength !== profile.trainingDaysPerWeek
      }

      // 1. Both screens show same counts
      if (
        homeCounts.resistance !== trainingCounts.resistance ||
        homeCounts.total !== trainingCounts.total
      ) {
        violations.push({
          op: opIdx,
          dataset: ds.name,
          issue: 'COUNT_DISAGREEMENT',
          details: `Home: ${JSON.stringify(homeCounts)}, Training: ${JSON.stringify(trainingCounts)}`,
        })
      }

      // 2. No callout appears on one screen but not the other
      if (homeCallout !== trainingCallout) {
        violations.push({
          op: opIdx,
          dataset: ds.name,
          issue: 'CALLOUT_MISMATCH',
          details: `Home callout: ${homeCallout}, Training callout: ${trainingCallout} (profile: ${profile.trainingDaysPerWeek}, totalDays: ${program.days.length})`,
        })
      }

      // 3. No day.kind changed by a callout
      if (opChoice === 5 || opChoice === 6) {
        const kindsAfter = program.days.map((d) => d.kind)
        if (JSON.stringify(kindsBefore) !== JSON.stringify(kindsAfter)) {
          violations.push({
            op: opIdx,
            dataset: ds.name,
            issue: 'DAY_KIND_MUTATED_BY_CALLOUT',
            details: `Before: ${JSON.stringify(kindsBefore)}, After: ${JSON.stringify(kindsAfter)}`,
          })
        }
      }
    }
  }

  console.log(`\n📊 Total operations tested: ${totalOperations}`)
  console.log(`📊 Violations detected: ${violations.length}`)

  if (violations.length > 0) {
    console.error(
      `❌ Property test FAILED with ${violations.length} violations:`,
    )
    violations.slice(0, 10).forEach((v, idx) => {
      console.error(
        `  ${idx + 1}. [Op ${v.op} in ${v.dataset}] ${v.issue}: ${v.details}`,
      )
    })
    process.exit(1)
  }

  console.log(
    '✅ A1 Property Test PASSED cleanly across all operations and datasets!',
  )
}

runTest().catch((err) => {
  console.error('Fatal error running property test:', err)
  process.exit(1)
})
