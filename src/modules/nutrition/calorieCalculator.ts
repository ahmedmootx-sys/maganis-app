import type { ActivityLevel, Sex, UserProfile } from '../onboarding/types.ts'
import { ACTIVITY_LEVELS } from '../onboarding/types.ts'
import type { CalorieMacroTarget } from './types.ts'
import {
  calculateNutritionTargets,
  calculateBMR as engineCalculateBMR,
  mapLegacyActivityToLifestyle,
  type LifestyleLevel,
  type NutritionGoal,
  type WorkoutBlockInput,
} from './nutritionEngine.ts'

export function calculateBMR(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
  bodyFatPercent?: number,
): number {
  const res = engineCalculateBMR(sex, weightKg, heightCm, age, bodyFatPercent)
  return Math.round(res.bmr)
}

export function getActivityMultiplier(level: ActivityLevel): number {
  const found = ACTIVITY_LEVELS.find((a) => a.value === level)
  return found ? Number(found.multiplier) || 1.2 : 1.2
}

/**
 * Maps UserProfile to the Evidence-Based Nutrition Engine
 */
export function calculateCalorieMacroTargets(
  profile: UserProfile,
): CalorieMacroTarget {
  const sex = profile.body.sex || 'male'
  const weightKg = Number(profile.body.weightKg) || 70
  const heightCm = Number(profile.body.heightCm) || 170
  const age = Number(profile.body.age) || 25

  // Map or read lifestyle
  let lifestyle: LifestyleLevel = profile.body.lifestyle ?? 2
  if (!profile.body.lifestyle) {
    lifestyle = mapLegacyActivityToLifestyle(profile.body.activityLevel)
  }

  // Map or read workout blocks
  let workoutBlocks: WorkoutBlockInput[] = profile.body.workoutBlocks ?? []
  if (workoutBlocks.length === 0) {
    const sessions = profile.trainingDaysPerWeek || 4
    workoutBlocks = [
      {
        type: 'resistance',
        sessionsPerWeek: sessions,
        minutesPerSession: profile.body.sessionMinutes || 60,
        intensity: profile.body.sessionIntensity || 'moderate',
      },
    ]
  }

  // Map goal
  let goal: NutritionGoal = 'maintain'
  if (profile.primaryGoal === 'hypertrophy') {
    goal = 'gain'
  } else if (profile.primaryGoal === 'cut') {
    goal = 'lose'
  }

  const engineRes = calculateNutritionTargets({
    sex,
    age,
    weightKg,
    heightCm,
    bodyFatPercent: profile.body.bodyFatPercent,
    lifestyle,
    workoutBlocks,
    goal,
    pace: profile.body.pace || 'standard',
    formulaOverride: profile.body.formulaOverride,
    proteinPerKgOverride: profile.body.proteinPerKgOverride,
  })

  let goalLabelAr = 'المحافظة على الوزن'
  if (goal === 'gain') {
    goalLabelAr = `بناء عضلات وتضخيم (فائض +${engineRes.adjustmentKcal} كالوِري)`
  } else if (goal === 'lose') {
    goalLabelAr = `تنشيف وحرق دهون (عجز ${engineRes.adjustmentKcal} كالوِري)`
  }

  return {
    bmr: engineRes.bmr,
    tdee: engineRes.tdee,
    targetCalories: engineRes.targetCalories,
    displayCalories: engineRes.displayCalories,
    proteinGrams: engineRes.protein.grams,
    carbsGrams: engineRes.carbs.grams,
    fatsGrams: engineRes.fat.grams,
    goalLabelAr,
    waterLiters: engineRes.waterLiters,
    engineResult: engineRes,
  }
}
