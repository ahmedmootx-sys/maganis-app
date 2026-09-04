import { describe, expect, it } from 'vitest'
import {
  EGYPTIAN_MEALS,
  getMealsByCategory,
  getMealsByGoal,
} from './egyptianMeals.ts'

describe('egyptianMeals', () => {
  it('contains authentic Egyptian meals with valid macros and ingredients', () => {
    expect(EGYPTIAN_MEALS.length).toBeGreaterThan(5)
    EGYPTIAN_MEALS.forEach((meal) => {
      expect(meal.nameAr).toBeTruthy()
      expect(meal.calories).toBeGreaterThan(0)
      expect(meal.proteinGrams).toBeGreaterThan(0)
      expect(meal.ingredientsAr.length).toBeGreaterThan(0)
      expect(meal.portionAr).toBeTruthy()
    })
  })

  it('filters meals by goal correctly', () => {
    const cutMeals = getMealsByGoal('cut')
    expect(cutMeals.length).toBeGreaterThan(0)
    expect(cutMeals.every((m) => m.suitableGoals.includes('cut'))).toBe(true)

    const hypertrophyMeals = getMealsByGoal('hypertrophy')
    expect(hypertrophyMeals.length).toBeGreaterThan(0)
  })

  it('filters meals by category correctly', () => {
    const breakfasts = getMealsByCategory('breakfast')
    expect(breakfasts.length).toBeGreaterThan(0)
    expect(breakfasts.every((m) => m.category === 'breakfast')).toBe(true)

    const lunches = getMealsByCategory('lunch')
    expect(lunches.length).toBeGreaterThan(0)
    expect(lunches.every((m) => m.category === 'lunch')).toBe(true)
  })
})
