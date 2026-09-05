import type { Exercise, ProgramDay, ProgramExercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'

/**
 * Workout and exercise helper utility functions.
 */

/**
 * Formats a total duration in seconds to MM:SS string.
 */
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '00:00'
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Converts all exercises of a program day to home-friendly equivalents
 * (bodyweight, resistance band, dumbbell) targeting the exact same muscle groups.
 */
export function convertDayToHomeWorkout(
  day: ProgramDay,
  customExercises: Exercise[] = [],
  userInjuries: string[] = [],
  excludedExerciseIds: string[] = [],
): ProgramDay {
  const allExercises = [...EXERCISES, ...customExercises].filter(
    (e) =>
      !excludedExerciseIds.includes(e.id) &&
      (!userInjuries.length ||
        !e.avoidForInjuries?.some((inj) => userInjuries.includes(inj))),
  )

  const homePool = allExercises.filter(
    (e) =>
      e.equipment === 'bodyweight' ||
      e.equipment === 'band' ||
      e.equipment === 'dumbbell',
  )

  const usedToday = new Set<string>()
  const newExercises: ProgramExercise[] = []

  for (const pe of day.exercises) {
    const current = allExercises.find((e) => e.id === pe.exerciseId)
    if (!current) {
      newExercises.push(pe)
      continue
    }

    // If already home-friendly and not already used, keep it
    if (
      (current.equipment === 'bodyweight' ||
        current.equipment === 'band' ||
        current.equipment === 'dumbbell') &&
      !usedToday.has(current.id)
    ) {
      usedToday.add(current.id)
      newExercises.push(pe)
      continue
    }

    // Find best home alternative in same category and matching sub-muscle
    const candidates = homePool.filter(
      (h) => h.category === current.category && !usedToday.has(h.id),
    )

    let match = candidates.find(
      (c) =>
        c.targetSubMuscleAr &&
        current.targetSubMuscleAr &&
        c.targetSubMuscleAr === current.targetSubMuscleAr,
    )

    if (!match && candidates.length > 0) {
      // Prioritize same difficulty
      match =
        candidates.find((c) => c.difficulty === current.difficulty) ||
        candidates[0]
    }

    if (match) {
      usedToday.add(match.id)
      newExercises.push({
        ...pe,
        exerciseId: match.id,
      })
    } else {
      // Fallback: any unused home exercise from same category
      const fallback = homePool.find(
        (h) => h.category === current.category && !usedToday.has(h.id),
      )
      if (fallback) {
        usedToday.add(fallback.id)
        newExercises.push({
          ...pe,
          exerciseId: fallback.id,
        })
      } else {
        newExercises.push(pe)
      }
    }
  }

  return {
    ...day,
    exercises: newExercises,
  }
}
