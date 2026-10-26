import { describe, it, expect } from 'vitest'
import { generateProgram } from './programGenerator.ts'
import { deriveConstraints, isExerciseAllowed } from './constraints.ts'
import { EXERCISES } from './exercises.ts'
import type { UserProfile, TrainingStyle, Goal } from '../onboarding/types.ts'
import type { WorkoutSplitType } from '../shared/types.ts'

describe('Generator Matrix Test - 225 Onboarding Combinations', () => {
  const styles: Array<{
    name: string
    trainingStyle: TrainingStyle[]
    primaryGoal: Goal
    trainingLocation: 'gym' | 'home' | 'both'
    equipmentAvailable?: string[]
  }> = [
    {
      name: 'calisthenics_home',
      trainingStyle: ['calisthenics'],
      primaryGoal: 'calisthenics',
      trainingLocation: 'home',
    },
    {
      name: 'home_dumbbells',
      trainingStyle: ['weights'],
      primaryGoal: 'hypertrophy',
      trainingLocation: 'home',
      equipmentAvailable: ['dumbbell', 'bodyweight'],
    },
    {
      name: 'full_gym',
      trainingStyle: ['weights'],
      primaryGoal: 'hypertrophy',
      trainingLocation: 'gym',
      equipmentAvailable: [
        'barbell',
        'dumbbell',
        'machine',
        'cables',
        'bodyweight',
      ],
    },
  ]

  const splits: WorkoutSplitType[] = [
    'ppl',
    'upper_lower',
    'arnold',
    'bro_split',
    'full_body',
  ]
  const daysOptions = [2, 3, 4, 5, 6]
  const levelOptions: Array<'beginner' | 'intermediate' | 'advanced'> = [
    'beginner',
    'intermediate',
    'advanced',
  ]

  let runCount = 0

  for (const style of styles) {
    for (const split of splits) {
      for (const days of daysOptions) {
        for (const level of levelOptions) {
          runCount++
          it(`Matrix run #${runCount}: [${style.name}] [${split}] [${days}d] [${level}]`, () => {
            const profile: Partial<UserProfile> = {
              primaryGoal: style.primaryGoal,
              trainingStyle: style.trainingStyle,
              trainingLocation: style.trainingLocation,
              equipmentAvailable: style.equipmentAvailable,
              experienceLevel: level,
              trainingDaysPerWeek: days,
              medical: { hasIssues: false, injuryTags: [], notes: '' },
              body: {
                sex: 'male',
                age: 26,
                heightCm: 175,
                weightKg: 75,
                activityLevel: 'moderate',
                lifestyle: 2,
              },
            }

            const constraints = deriveConstraints(profile as UserProfile)
            const program = generateProgram({
              goal: style.primaryGoal,
              trainingDaysPerWeek: days,
              splitType: split,
              profile: profile as UserProfile,
              constraints,
            })

            // 1. Day count matches chosen days
            expect(program.days.length).toBe(days)

            // 2. No day is empty
            for (const day of program.days) {
              expect(day.exercises.length).toBeGreaterThan(0)

              // 3. Every exercise is allowed by constraints
              for (const pe of day.exercises) {
                const catalogEx = EXERCISES.find((e) => e.id === pe.exerciseId)
                if (catalogEx) {
                  expect(isExerciseAllowed(catalogEx, constraints)).toBe(true)
                }

                // 4. No exercise with weight measurement appears for bodyweight style
                if (!constraints.allowsLoadedExercises) {
                  expect(pe.targetWeightKg ?? 0).toBe(0)
                  expect(pe.reps).toBe(0) // AMRAP / bodyweight
                }
              }
            }
          })
        }
      }
    }
  }

  it(`verifies matrix ran at least 200 combinations (actually ran ${runCount})`, () => {
    expect(runCount).toBeGreaterThanOrEqual(200)
  })

  it('generates Arabic notice when a slot cannot be filled with allowed equipment', () => {
    // Artificial constraint: allow ONLY other equipment (which has no chest exercises)
    const strictConstraints = {
      allowedEquipment: new Set<string>(['other']),
      allowsLoadedExercises: false,
      levelCeiling: 'beginner' as const,
      excludedExerciseKeys: new Set<string>(),
      isCalisthenicsOnly: true,
      isHomeDumbbellsOnly: false,
      measurementDefaults: {
        weightDefault: 0,
        repsDefault: 10,
        restSecondsDefault: 60,
      },
    }

    const program = generateProgram({
      goal: 'calisthenics',
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      constraints: strictConstraints,
    })

    const notices: string[] = (program as any).generationNotices || []
    expect(notices.length).toBeGreaterThan(0)
    const hasNotice = notices.some((n: string) =>
      n.startsWith('مفيش تمرين مناسب لـ'),
    )
    expect(hasNotice).toBe(true)
  })
})
