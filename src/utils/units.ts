/**
 * src/utils/units.ts
 * Centralized Measurement & Calorie Unit Dictionary (TASK G3 Part 3)
 */

import { plural } from './plural.ts'

export const UNITS = {
  calorie: 'سعرة',
  caloriePlural: 'سعرات',
  gram: 'جم',
  kg: 'كجم',
  cm: 'سم',
  minute: 'دقيقة',
  second: 'ثانية',
  rep: 'تكرار',
  set: 'مجموعة',
} as const

/**
 * Formats calorie amount according to Arabic grammar rules.
 * e.g. formatCalories(1) -> "1 سعرة", formatCalories(2) -> "2 سعرتان", formatCalories(5) -> "5 سعرات", formatCalories(2500) -> "2500 سعرة"
 */
export function formatCalories(amount: number, forceNumber = true): string {
  return plural(amount, 'سعرة', forceNumber)
}
