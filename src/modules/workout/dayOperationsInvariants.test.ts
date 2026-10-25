import { describe, it, expect } from 'vitest'
import { selectWeekLoad } from './weekLoadSelector.ts'
import type { WorkoutProgram, ProgramDay } from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'
import fs from 'node:fs'
import path from 'node:path'

// Seeded PRNG for reproducible test sequences
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('B2 & B3.2: Seeded Random-Sequence Invariant Test (300+ ops)', () => {
  it('preserves all G5-A invariants across 350 random day operations on fixture and owner data', () => {
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
            { dayIndex: 0, kind: 'strength', focus: 'Upper', labelAr: 'علوي', exercises: [{ exerciseId: 'bench_press', sets: 3, reps: 10, restSeconds: 60 }] },
            { dayIndex: 1, kind: 'strength', focus: 'Lower', labelAr: 'سفلي', exercises: [{ exerciseId: 'squat', sets: 3, reps: 8, restSeconds: 90 }] },
            { dayIndex: 2, kind: 'strength', focus: 'Push', labelAr: 'دفع', exercises: [{ exerciseId: 'overhead_press', sets: 3, reps: 10, restSeconds: 60 }] },
            { dayIndex: 3, kind: 'strength', focus: 'Pull', labelAr: 'سحب', exercises: [{ exerciseId: 'lat_pulldown', sets: 3, reps: 12, restSeconds: 60 }] },
            { dayIndex: 4, kind: 'strength', focus: 'Legs', labelAr: 'أرجل', exercises: [{ exerciseId: 'leg_press', sets: 3, reps: 12, restSeconds: 60 }] },
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
            { dayIndex: 0, kind: 'strength', focus: 'Upper A', labelAr: 'علوي أ', exercises: [{ exerciseId: 'bench_press', sets: 4, reps: 8, restSeconds: 90 }] },
            { dayIndex: 1, kind: 'strength', focus: 'Lower A', labelAr: 'سفلي أ', exercises: [{ exerciseId: 'squat', sets: 4, reps: 8, restSeconds: 120 }] },
            { dayIndex: 2, kind: 'strength', focus: 'Upper B', labelAr: 'علوي ب', exercises: [{ exerciseId: 'overhead_press', sets: 4, reps: 8, restSeconds: 90 }] },
            { dayIndex: 3, kind: 'strength', focus: 'Lower B', labelAr: 'سفلي ب', exercises: [{ exerciseId: 'deadlift', sets: 3, reps: 5, restSeconds: 120 }] },
          ],
        },
      },
    ]

    const rng = mulberry32(1337)

    for (const ds of datasets) {
      const profile = JSON.parse(JSON.stringify(ds.profile))
      const program = JSON.parse(JSON.stringify(ds.program))

      for (let opIdx = 0; opIdx < 350; opIdx++) {
        const op = Math.floor(rng() * 8)
        const kindsBefore = program.days.map((d: ProgramDay) => d.kind)

        if (op === 0) {
          // 1. Add resistance day (up to max 7 days)
          if (program.days.length < 7) {
            program.days.push({
              id: `day-${Date.now()}-${opIdx}`,
              dayIndex: program.days.length,
              kind: 'strength',
              focus: 'New Strength',
              labelAr: `يوم مقاومة ${program.days.length + 1}`,
              exercises: [{ exerciseId: 'pushup', sets: 3, reps: 10, restSeconds: 60 }],
            })
          }
        } else if (op === 1) {
          // 2. Add cardio day (up to max 7 days)
          if (program.days.length < 7) {
            program.days.push({
              id: `day-${Date.now()}-${opIdx}`,
              dayIndex: program.days.length,
              kind: 'cardio',
              focus: 'Cardio',
              labelAr: `يوم كارديو ${program.days.length + 1}`,
              cardio: { plannedMinutes: 20, activity: 'bike', effort: 'moderate' },
              exercises: [],
            })
          }
        } else if (op === 2) {
          // 3. Duplicate an existing day (B2)
          if (program.days.length > 0 && program.days.length < 7) {
            const srcIdx = Math.floor(rng() * program.days.length)
            const srcDay = program.days[srcIdx]
            const nextIdx = Math.max(...program.days.map((d: ProgramDay) => d.dayIndex)) + 1
            const clonedDay: ProgramDay = {
              ...srcDay,
              id: `day-cloned-${Date.now()}-${opIdx}`,
              dayIndex: nextIdx,
              name: `${srcDay.name || srcDay.labelAr} (نسخة)`,
              labelAr: `${srcDay.name || srcDay.labelAr} (نسخة)`,
              customName: `${srcDay.name || srcDay.labelAr} (نسخة)`,
              exercises: (srcDay.exercises || []).map((pe: any) => ({ ...pe })),
              cardioConfig: srcDay.cardioConfig ? { ...srcDay.cardioConfig } : undefined,
              finisher: srcDay.finisher ? { ...srcDay.finisher } : undefined,
            }
            program.days.push(clonedDay)
          }
        } else if (op === 3) {
          // 4. Delete day (preserve at least 1 day)
          if (program.days.length > 1) {
            const delIdx = Math.floor(rng() * program.days.length)
            program.days.splice(delIdx, 1)
          }
        } else if (op === 4) {
          // 5. Add or modify cardio finisher on a resistance day (B3.2)
          const resistanceDays = program.days.filter((d: ProgramDay) => d.kind !== 'cardio')
          if (resistanceDays.length > 0) {
            const targetDay = resistanceDays[Math.floor(rng() * resistanceDays.length)]
            targetDay.finisher = {
              activity: 'جري خفيف',
              minutes: 15 + Math.floor(rng() * 4) * 5, // 15, 20, 25, 30
              level: 'متوسط',
            }
          }
        } else if (op === 5) {
          // 6. Remove cardio finisher from a resistance day
          const withFinisher = program.days.filter((d: ProgramDay) => d.finisher)
          if (withFinisher.length > 0) {
            const target = withFinisher[Math.floor(rng() * withFinisher.length)]
            target.finisher = null
          }
        } else if (op === 6) {
          // 7. Change profile trainingDaysPerWeek
          profile.trainingDaysPerWeek = 2 + Math.floor(rng() * 5)
        } else if (op === 7) {
          // 8. Tap mismatch callout action (sync days)
          const load = selectWeekLoad(profile, program)
          if (load.resistanceDays !== profile.trainingDaysPerWeek) {
            profile.trainingDaysPerWeek = load.resistanceDays
          }
        }

        // --- G5-A Invariants check after EVERY single operation ---
        const load = selectWeekLoad(profile, program)

        // Invariant 1: resistanceDays counts only strength days (kind !== 'cardio' && kind !== 'mobility')
        const expectedResistance = program.days.filter((d: ProgramDay) => d.kind !== 'cardio' && d.kind !== 'mobility').length
        expect(load.resistanceDays).toBe(expectedResistance)

        // Invariant 2: cardioDays counts only full cardio days (finishers NEVER count as cardio days)
        const expectedCardio = program.days.filter((d: ProgramDay) => d.kind === 'cardio').length
        expect(load.cardioDays).toBe(expectedCardio)

        // Invariant 3: totalScheduledSessions is strictly the sum of full days
        expect(load.totalScheduledSessions).toBe(load.resistanceDays + load.cardioDays + load.mobilityDays)

        // Invariant 4: restDays + totalScheduledSessions == 7 (or restDays == 0 if >= 7)
        if (load.totalScheduledSessions <= 7) {
          expect(load.restDays + load.totalScheduledSessions).toBe(7)
        } else {
          expect(load.restDays).toBe(0)
        }

        // Invariant 5: plannedCardioMinutes includes finishers and cardio days
        let expectedCardioMinutes = 0
        for (const d of program.days) {
          if (d.kind === 'cardio') {
            expectedCardioMinutes += (d.cardio?.plannedMinutes ?? d.cardioConfig?.plannedMinutes ?? 30)
          }
          if (d.finisher) {
            expectedCardioMinutes += (d.finisher.minutes ?? 0)
          }
        }
        expect(load.plannedCardioMinutes).toBe(expectedCardioMinutes)

        // Invariant 6: Tapping mismatch callout immediately stabilizes
        if (op === 7) {
          const loadAfterSync = selectWeekLoad(profile, program)
          expect(loadAfterSync.resistanceDays).toBe(profile.trainingDaysPerWeek)
          // No day kind was mutated by callout
          const kindsAfter = program.days.map((d: ProgramDay) => d.kind)
          expect(kindsAfter).toEqual(kindsBefore)
        }
      }
    }
  })
})
