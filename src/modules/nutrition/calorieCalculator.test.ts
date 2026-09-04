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

  it('calculates calorie surplus and protein intake for hypertrophy goal', () => {
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
        activityLevel: 'moderate', // multiplier 1.55 -> TDEE 1805 * 1.55 = 2798
      },
    }

    const result = calculateCalorieMacroTargets(mockProfile)
    expect(result.bmr).toBe(1805)
    expect(result.tdee).toBe(2798)
    expect(result.targetCalories).toBe(3198) // TDEE + 400 surplus
    expect(result.proteinGrams).toBe(160) // 80kg * 2.0g/kg
    expect(result.waterLiters).toBe(2.8) // 80 * 0.035
  })

  it('calculates calorie deficit and high protein intake for cut goal', () => {
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
        activityLevel: 'active', // multiplier 1.725
      },
    }

    const result = calculateCalorieMacroTargets(mockProfile)
    expect(result.proteinGrams).toBe(143) // 65kg * 2.2g/kg
    expect(result.targetCalories).toBeLessThan(result.tdee)
  })
})
