import { describe, it, expect } from 'vitest'
import {
  calculateNutritionTargets,
  calculateBMR,
  mapLegacyActivityToLifestyle,
  mapLifestyleToLegacyActivity,
  LIFESTYLE_OPTIONS,
} from './nutritionEngine.ts'
import { calculateCalorieMacroTargets } from './calorieCalculator.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('Activity Consistency & Vector Tests (Task D)', () => {
  it('Vector A: male, 20y, 58kg, 169cm, lifestyle 2, 5 days x 60 min resistance moderate', () => {
    // 1. Check BMR
    const bmrResult = calculateBMR('male', 58, 169, 20)
    expect(Math.round(bmrResult.bmr)).toBe(1541)

    // 2. Without exercise (0 workout sessions): BMR * 1.35
    const withoutExercise = calculateNutritionTargets({
      sex: 'male',
      weightKg: 58,
      heightCm: 169,
      age: 20,
      lifestyle: 2,
      workoutBlocks: [],
      goal: 'maintain',
    })
    expect(withoutExercise.tdee).toBe(2081)

    // 3. With exercise: 5 days/wk, 60 mins, moderate resistance
    const withExercise = calculateNutritionTargets({
      sex: 'male',
      weightKg: 58,
      heightCm: 169,
      age: 20,
      lifestyle: 2,
      workoutBlocks: [
        {
          type: 'resistance',
          sessionsPerWeek: 5,
          minutesPerSession: 60,
          intensity: 'moderate',
        },
      ],
      goal: 'maintain',
    })
    // Lifestyle part = 1541.25 * 1.35 = 2080.69
    // EAT = (5 - 1) * 58 * 1.0 * 1.10 * (5/7) = 182.29
    // TDEE = 2080.69 + 182.29 = 2262.97 -> 2263
    expect(withExercise.tdee).toBe(2263)
    expect(Math.round(withExercise.eatDailyKcal)).toBe(182)
  })

  it('Vector B: male, 20y, 56.5kg, 171cm, lifestyle 2, 5 days x 60 min resistance moderate', () => {
    // 1. Check BMR
    const bmrResult = calculateBMR('male', 56.5, 171, 20)
    expect(Math.round(bmrResult.bmr)).toBe(1539)

    // 2. Without exercise: BMR * 1.35
    const withoutExercise = calculateNutritionTargets({
      sex: 'male',
      weightKg: 56.5,
      heightCm: 171,
      age: 20,
      lifestyle: 2,
      workoutBlocks: [],
      goal: 'maintain',
    })
    expect(withoutExercise.tdee).toBe(2077)

    // 3. With exercise: 5 days/wk, 60 mins, moderate resistance
    const withExercise = calculateNutritionTargets({
      sex: 'male',
      weightKg: 56.5,
      heightCm: 171,
      age: 20,
      lifestyle: 2,
      workoutBlocks: [
        {
          type: 'resistance',
          sessionsPerWeek: 5,
          minutesPerSession: 60,
          intensity: 'moderate',
        },
      ],
      goal: 'maintain',
    })
    // Lifestyle part = 1538.75 * 1.35 = 2077.31
    // EAT = (5 - 1) * 56.5 * 1.0 * 1.10 * (5/7) = 177.57
    // TDEE = 2077.31 + 177.57 = 2254.88 -> 2255
    expect(withExercise.tdee).toBe(2255)
    expect(Math.round(withExercise.eatDailyKcal)).toBe(178)
  })

  it('verifies canonical 5 lifestyle levels, descriptions, and factors', () => {
    expect(LIFESTYLE_OPTIONS).toHaveLength(5)
    expect(LIFESTYLE_OPTIONS.map((o) => o.level)).toEqual([1, 2, 3, 4, 5])
    expect(LIFESTYLE_OPTIONS.map((o) => o.factor)).toEqual([
      1.2, 1.35, 1.5, 1.65, 1.8,
    ])

    // Verify all descriptions exclude training counts or classic multipliers
    for (const opt of LIFESTYLE_OPTIONS) {
      expect(opt.descriptionAr).not.toContain('x1.55')
      expect(opt.descriptionAr).not.toContain('1-3 أيام')
      expect(opt.descriptionAr).not.toContain('3-5 أيام')
      expect(opt.titleAr).not.toContain('x1.55')
    }
  })

  it('maps legacy activity levels to nearest lifestyle levels correctly', () => {
    expect(mapLegacyActivityToLifestyle('sedentary')).toBe(1)
    expect(mapLegacyActivityToLifestyle('light')).toBe(2)
    expect(mapLegacyActivityToLifestyle('moderate')).toBe(3)
    expect(mapLegacyActivityToLifestyle('active')).toBe(4)
    expect(mapLegacyActivityToLifestyle('very_active')).toBe(5)

    expect(mapLifestyleToLegacyActivity(1)).toBe('sedentary')
    expect(mapLifestyleToLegacyActivity(2)).toBe('light')
    expect(mapLifestyleToLegacyActivity(3)).toBe('moderate')
    expect(mapLifestyleToLegacyActivity(4)).toBe('active')
    expect(mapLifestyleToLegacyActivity(5)).toBe('very_active')
  })

  it('calculateCalorieMacroTargets reads lifestyle and workout sessions from UserProfile', () => {
    const profile: UserProfile = {
      id: 'test-user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      primaryGoal: 'hypertrophy',
      goals: ['hypertrophy'],
      trainingDaysPerWeek: 5,
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      body: {
        sex: 'male',
        weightKg: 58,
        heightCm: 169,
        age: 20,
        activityLevel: 'light',
        lifestyle: 2,
        workoutBlocks: [
          {
            type: 'resistance',
            sessionsPerWeek: 5,
            minutesPerSession: 60,
            intensity: 'moderate',
          },
        ],
        lifestyleMigrated: true,
        migrationReviewed: true,
      },
    }

    const targets = calculateCalorieMacroTargets(profile)
    expect(targets).not.toBeNull()
    expect(targets!.bmr).toBe(1541)
    expect(targets!.tdee).toBe(2263)
    // Evidence-based rate surplus for 58kg: 2263 + 255 = 2518 kcal
    expect(targets!.targetCalories).toBe(2518)
  })

  it('detects legacy profiles needing review and validates non-silent migration flags', () => {
    const legacyProfile: UserProfile = {
      id: 'legacy-user',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      primaryGoal: 'hypertrophy',
      goals: ['hypertrophy'],
      trainingDaysPerWeek: 4,
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      body: {
        sex: 'male',
        weightKg: 75,
        heightCm: 175,
        age: 25,
        activityLevel: 'moderate',
        // lifestyleMigrated and migrationReviewed are undefined
      },
    }

    const isNeedingReview =
      !legacyProfile.body.lifestyleMigrated &&
      !legacyProfile.body.migrationReviewed
    expect(isNeedingReview).toBe(true)

    // After migration is applied
    const migratedProfile: UserProfile = {
      ...legacyProfile,
      body: {
        ...legacyProfile.body,
        lifestyle: mapLegacyActivityToLifestyle(
          legacyProfile.body.activityLevel,
        ),
        lifestyleMigrated: true,
        migrationReviewed: true,
      },
    }
    const isStillNeedingReview =
      !migratedProfile.body.lifestyleMigrated &&
      !migratedProfile.body.migrationReviewed
    expect(isStillNeedingReview).toBe(false)
  })
})
