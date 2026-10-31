import type { ProgramDay, Exercise, ProgramExercise } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'

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

    const candidates = homePool.filter(
      (e) =>
        e.category === current.category &&
        !usedToday.has(e.id) &&
        e.targetSubMuscleAr === current.targetSubMuscleAr,
    )

    const match = candidates[0]

    if (match) {
      usedToday.add(match.id)
      newExercises.push({
        ...pe,
        exerciseId: match.id,
      })
    } else {
      const fallback = homePool.find(
        (e) => e.category === current.category && !usedToday.has(e.id),
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
