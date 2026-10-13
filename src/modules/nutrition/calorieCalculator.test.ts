import { describe, expect, it } from 'vitest'
import {
  calculateBMR,
  calculateCalorieMacroTargets,
  getActivityMultiplier,
} from './calorieCalculator.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('calorieCalculator', () => {
  it('calculates BMR accurately using Mifflin-St Jeor equation for male and female', () => {
    // Male: 80kg, 180cm, 25yr -> (10*80) + (6.25*180) - (5*25) + 5 = 800 + 1125 - 125 + 5 = 1805
    const bmrMale = calculateBMR('male', 80, 180, 25)
    expect(bmrMale).toBe(1805)

    // Female: 60kg, 165cm, 30yr -> (10*60) + (6.25*165) - (5*30) - 161 = 600 + 1031.25 - 150 - 161 = 1320
    const bmrFemale = calculateBMR('female', 60, 165, 30)
    expect(bmrFemale).toBe(1320)
  })

  it('returns correct activity multipliers', () => {
    expect(getActivityMultiplier('sedentary')).toBe(1.2)
    expect(getActivityMultiplier('moderate')).toBe(1.55)
    expect(getActivityMultiplier('very_active')).toBe(1.9)
  })

  it('calculates evidence-based TDEE and rate-based targets for hypertrophy goal', () => {
    const mockProfile: UserProfile = {
      id: 'p-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      goals: ['hypertrophy'],
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      body: {
        sex: 'male',
        age: 25,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'moderate',
        lifestyle: 2,
        workoutBlocks: [
          {
            type: 'resistance',
            sessionsPerWeek: 4,
            minutesPerSession: 60,
            intensity: 'moderate',
          },
        ],
      },
    }

    const result = calculateCalorieMacroTargets(mockProfile)
    expect(result.bmr).toBe(1805)
    expect(result.tdee).toBeGreaterThan(2000)
    expect(result.targetCalories).toBeGreaterThan(result.tdee) // Surplus
    expect(result.proteinGrams).toBeGreaterThan(120)
    expect(result.waterLiters).toBe(2.8) // 80 * 0.035
    expect(result.engineResult).toBeDefined()
  })

  it('calculates calorie deficit and protein for cut goal', () => {
    const mockProfile: UserProfile = {
      id: 'p-2',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      goals: ['cut'],
      primaryGoal: 'cut',
      trainingDaysPerWeek: 5,
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      body: {
        sex: 'female',
        age: 28,
        heightCm: 165,
        weightKg: 65,
        activityLevel: 'active',
        lifestyle: 2,
      },
    }

    const result = calculateCalorieMacroTargets(mockProfile)
    expect(result.targetCalories).toBeLessThanOrEqual(result.tdee)
    expect(result.proteinGrams).toBeGreaterThan(100)
    expect(result.engineResult).toBeDefined()
  })
})
