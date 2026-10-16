import type { Exercise } from '../shared/types.ts'
import { resolveMuscles, type ExerciseMuscleTarget } from './muscleResolver.ts'

export { resolveMuscles }
export type { ExerciseMuscleTarget }

/**
 * Backward-compatible wrapper around resolveMuscles
 */
export function resolveExerciseMuscles(exercise: Partial<Exercise> | any): {
  muscles: ExerciseMuscleTarget[]
  isProvisional: boolean
  tier?: number
  caption?: string
  note?: string
} {
  const result = resolveMuscles(exercise)
  return {
    muscles: result.muscles,
    isProvisional: result.tier === 3 || !!result.isProvisional,
    tier: result.tier,
    caption: result.caption,
    note: result.note,
  }
}
