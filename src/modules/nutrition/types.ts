import type { Goal } from '../onboarding/types.ts'

export interface CalorieMacroTarget {
  bmr: number
  tdee: number
  targetCalories: number
  proteinGrams: number
  carbsGrams: number
  fatsGrams: number
  goalLabelAr: string
  waterLiters: number
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface EgyptianMeal {
  id: string
  nameAr: string
  category: MealCategory
  descriptionAr: string
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatsGrams: number
  portionAr: string
  ingredientsAr: string[]
  recipeStepsAr?: string[]
  suitableGoals: Goal[]
  scientificTipAr?: string
}
