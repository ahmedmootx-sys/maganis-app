import { describe, it, expect } from 'vitest'
import { selectWeekLoad } from './weekLoadSelector.ts'
import type { WorkoutProgram } from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'
import fs from 'node:fs'
import path from 'node:path'

// Seeded PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('A1: Day-Count Selector & Property Invariants', () => {
  it('passes 500 random operations across fixture and real owner data', () => {
    const ownerDump = JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), 'docs/owner-profile-dump.json'),
        'utf8',
      ),
    )
    const initialProfile: UserProfile = ownerDump.profile

    const datasets: Array<{
      name: string
      profile: UserProfile
      program: WorkoutProgram
    }> = [
      {
        name: 'Owner Data (5 resistance + 1 cardio)',
        profile: { ...initialProfile, trainingDaysPerWeek: 5 },
        program: {
          id: 'owner-prog',
          title: 'Owner Program',
          primaryGoal: 'hypertrophy',
          splitType: 'custom',
          trainingDaysPerWeek: 5,
          createdAt: Date.now(),
          days: [
            { dayIndex: 0, kind: 'strength', focus: 'Upper', labelAr: 'علوي', exercises: [] },
            { dayIndex: 1, kind: 'strength', focus: 'Lower', labelAr: 'سفلي', exercises: [] },
            { dayIndex: 2, kind: 'strength', focus: 'Push', labelAr: 'دفع', exercises: [] },
            { dayIndex: 3, kind: 'strength', focus: 'Pull', labelAr: 'سحب', exercises: [] },
            { dayIndex: 4, kind: 'strength', focus: 'Legs', labelAr: 'أرجل', exercises: [] },
            { dayIndex: 5, kind: 'cardio', focus: 'Cardio', labelAr: 'كارديو', cardio: { plannedMinutes: 30, activity: 'running', effort: 'moderate' }, exercises: [] },
          ],
        },
      },
      {
        name: 'Fixture Data (4 resistance)',
        profile: { ...initialProfile, trainingDaysPerWeek: 4 },
        program: {
          id: 'fixture-prog',
          title: 'Fixture Program',
          primaryGoal: 'hypertrophy',
          splitType: 'upper_lower',
          trainingDaysPerWeek: 4,
          createdAt: Date.now(),
          days: [
            { dayIndex: 0, kind: 'strength', focus: 'Upper A', labelAr: 'علوي أ', exercises: [] },
            { dayIndex: 1, kind: 'strength', focus: 'Lower A', labelAr: 'سفلي أ', exercises: [] },
            { dayIndex: 2, kind: 'strength', focus: 'Upper B', labelAr: 'علوي ب', exercises: [] },
            { dayIndex: 3, kind: 'strength', focus: 'Lower B', labelAr: 'سفلي ب', exercises: [] },
          ],
        },
      },
    ]

    const rng = mulberry32(4242)

    for (const ds of datasets) {
      const profile = JSON.parse(JSON.stringify(ds.profile))
      const program = JSON.parse(JSON.stringify(ds.program))

      for (let opIdx = 0; opIdx < 500; opIdx++) {
        const op = Math.floor(rng() * 7)
        const kindsBefore = program.days.map((d: any) => d.kind)

        if (op === 0) {
          // Add resistance day
          program.days.push({
            dayIndex: program.days.length,
            kind: 'strength',
            focus: 'New Strength',
            labelAr: 'يوم مقاومة',
            exercises: [],
          })
        } else if (op === 1 && program.days.some((d: any) => d.kind === 'strength' || !d.kind)) {
          const idx = program.days.findIndex((d: any) => d.kind === 'strength' || !d.kind)
          program.days.splice(idx, 1)
        } else if (op === 2) {
          // Add cardio day
          program.days.push({
            dayIndex: program.days.length,
            kind: 'cardio',
            focus: 'Cardio',
            labelAr: 'كارديو',
            cardio: { plannedMinutes: 25, activity: 'bike', effort: 'moderate' },
            exercises: [],
          })
        } else if (op === 3 && program.days.some((d: any) => d.kind === 'cardio')) {
          const idx = program.days.findIndex((d: any) => d.kind === 'cardio')
          program.days.splice(idx, 1)
        } else if (op === 4) {
          profile.trainingDaysPerWeek = 2 + Math.floor(rng() * 5)
        } else if (op === 5 || op === 6) {
          // Tap callout action on Home or Training
          const load = selectWeekLoad(profile, program)
          if (load.resistanceDays !== profile.trainingDaysPerWeek) {
            profile.trainingDaysPerWeek = load.resistanceDays
          }
        }

        // Invariants after every operation:
        const load = selectWeekLoad(profile, program)

        // 1. resistanceDays counts only strength/non-cardio/non-mobility
        const expectedResistance = program.days.filter((d: any) => d.kind !== 'cardio' && d.kind !== 'mobility').length
        expect(load.resistanceDays).toBe(expectedResistance)

        // 2. cardioDays counts only cardio
        const expectedCardio = program.days.filter((d: any) => d.kind === 'cardio').length
        expect(load.cardioDays).toBe(expectedCardio)

        // 3. Total scheduled sessions is sum
        expect(load.totalScheduledSessions).toBe(load.resistanceDays + load.cardioDays + load.mobilityDays)

        // 4. Callout state is strictly determined by resistanceDays !== profile.trainingDaysPerWeek
        // If callout was just tapped, assert stable state reached in 1 tap
        if (op === 5 || op === 6) {
          const loadAfterTap = selectWeekLoad(profile, program)
          expect(loadAfterTap.resistanceDays).toBe(profile.trainingDaysPerWeek)
          // No callout should appear now
          expect(loadAfterTap.resistanceDays !== profile.trainingDaysPerWeek).toBe(false)

          // 5. Assert no day.kind was mutated by callout
          const kindsAfter = program.days.map((d: any) => d.kind)
          expect(kindsAfter).toEqual(kindsBefore)
        }
      }
    }
  })
})
