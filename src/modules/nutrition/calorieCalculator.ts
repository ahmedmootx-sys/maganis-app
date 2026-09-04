import type { ActivityLevel, Sex, UserProfile } from '../onboarding/types.ts'
import { ACTIVITY_LEVELS } from '../onboarding/types.ts'
import type { CalorieMacroTarget } from './types.ts'

/**
 * Mifflin-St Jeor BMR Formula:
 * Male: (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
 * Female: (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161
 */
export function calculateBMR(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(sex === 'male' ? base + 5 : base - 161)
}

export function getActivityMultiplier(level: ActivityLevel): number {
  const found = ACTIVITY_LEVELS.find((a) => a.value === level)
  return found ? found.multiplier : 1.2
}

/**
 * Calculates TDEE, Calorie targets, and Protein/Carb/Fat Macros based on scientific standards:
 * - Protein: 2.0g/kg for Hypertrophy/Cut, 1.8g/kg for Calisthenics, 1.6g/kg for Flexibility.
 * - Calorie Adjustment: Hypertrophy +400 kcal (Surplus), Cut -500 kcal (Deficit), Others Maintenance.
 */
export function calculateCalorieMacroTargets(
  profile: UserProfile,
): CalorieMacroTarget {
  const { sex, weightKg, heightCm, age, activityLevel } = profile.body
  const goal = profile.primaryGoal

  const bmr = calculateBMR(sex, weightKg, heightCm, age)
  const multiplier = getActivityMultiplier(activityLevel)
  const tdee = Math.round(bmr * multiplier)

  let targetCalories = tdee
  let proteinPerKg = 2.0
  let goalLabelAr = 'المحافظة على الوزن'

  switch (goal) {
    case 'hypertrophy':
      targetCalories = Math.round(tdee + 400)
      proteinPerKg = 2.0
      goalLabelAr = 'تضخيم وبناء عضلات (فائض سعرات +400)'
      break
    case 'cut':
      targetCalories = Math.round(tdee - 500)
      proteinPerKg = 2.2 // High protein to preserve lean muscle during deficit
      goalLabelAr = 'تنشيف وحرق دهون (عجز سعرات -500)'
      break
    case 'calisthenics':
      targetCalories = tdee
      proteinPerKg = 1.8
      goalLabelAr = 'تقوية التحكم بالجسم (سعرات المحافظة)'
      break
    case 'flexibility':
      targetCalories = tdee
      proteinPerKg = 1.6
      goalLabelAr = 'مرونة وصحة عامة (سعرات المحافظة)'
      break
  }

  // Ensure minimum calories don't drop below safe BMR floor
  const safeMinCalories = Math.max(targetCalories, Math.round(bmr * 0.95))

  // Protein calculation: weightKg * proteinPerKg
  const proteinGrams = Math.round(weightKg * proteinPerKg)
  const proteinCalories = proteinGrams * 4

  // Fats: 25% of total calories
  const fatCalories = safeMinCalories * 0.25
  const fatsGrams = Math.round(fatCalories / 9)

  // Remaining calories go to Carbohydrates
  const remainingCalories = Math.max(
    0,
    safeMinCalories - (proteinCalories + fatCalories),
  )
  const carbsGrams = Math.round(remainingCalories / 4)

  // Daily Water Intake (liters) = weightKg * 0.035
  const waterLiters = Number((weightKg * 0.035).toFixed(1))

  return {
    bmr,
    tdee,
    targetCalories: safeMinCalories,
    proteinGrams,
    carbsGrams,
    fatsGrams,
    goalLabelAr,
    waterLiters,
  }
}
