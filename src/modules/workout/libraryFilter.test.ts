import { describe, it, expect } from 'vitest'
import { deriveConstraints, isExerciseAllowed } from './constraints.ts'
import { EXERCISES } from './exercises.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('Exercise Library & Add-Exercise Picker Filtering (B1.3)', () => {
  it('filters catalog exercises to "مناسب لمعداتي" by default when calisthenics profile is active', () => {
    const profile: Partial<UserProfile> = {
      primaryGoal: 'calisthenics',
      trainingStyle: ['calisthenics'],
      trainingLocation: 'home',
    }

    const constraints = deriveConstraints(profile as UserProfile)
    expect(constraints.isCalisthenicsOnly).toBe(true)

    const filtered = EXERCISES.filter((e) => isExerciseAllowed(e, constraints))
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.length).toBeLessThan(EXERCISES.length)

    // All exercises in filtered list must only have bodyweight / none / other equipment
    for (const ex of filtered) {
      const eq = (ex.equipmentDetail as any)?.db || ex.equipment
      expect(['body only', 'bodyweight', 'none', 'other']).toContain(eq)
    }

    // Weighted exercises are excluded
    const benchPress = EXERCISES.find(
      (e) => e.nameEn === 'Barbell Bench Press' || e.id.includes('bench'),
    )
    if (benchPress && (benchPress.equipmentDetail as any)?.db === 'barbell') {
      expect(filtered.some((e) => e.id === benchPress.id)).toBe(false)
    }
  })

  it('home dumbbells profile allows dumbbells and bodyweight only', () => {
    const profile: Partial<UserProfile> = {
      trainingStyle: ['weights'],
      trainingLocation: 'home',
      equipmentAvailable: ['dumbbell', 'bodyweight'],
    }

    const constraints = deriveConstraints(profile as UserProfile)
    const filtered = EXERCISES.filter((e) => isExerciseAllowed(e, constraints))

    for (const ex of filtered) {
      const eq = (ex.equipmentDetail as any)?.db || ex.equipment
      expect([
        'dumbbell',
        'body only',
        'bodyweight',
        'none',
        'other',
      ]).toContain(eq)
    }
  })

  it('unrestricted profile allows all catalog exercises', () => {
    const constraints = deriveConstraints(null)
    const filtered = EXERCISES.filter((e) => isExerciseAllowed(e, constraints))
    expect(filtered.length).toBe(EXERCISES.length)
  })
})
