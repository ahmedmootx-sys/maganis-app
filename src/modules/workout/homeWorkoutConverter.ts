import type { ProgramDay, Exercise, ProgramExercise } from '../shared/types.ts'
import { MUSCLE_GROUP_LABELS } from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'
import { getExerciseEnvironment } from './workoutUtils.ts'

export interface HomeConversionResult {
  day: ProgramDay
  insufficientMuscles: string[]
  convertedCount: number
  unconvertedCount: number
}

/**
 * Checks whether an exercise can be performed in a home workout setting.
 */
export function isHomeFriendlyExercise(e: Exercise): boolean {
  const env = getExerciseEnvironment(e)
  if (env === 'home' || env === 'both') return true
  return (
    e.equipment === 'bodyweight' ||
    e.equipment === 'band' ||
    e.equipment === 'dumbbell'
  )
}

/**
 * Converts all exercises of a program day to home-friendly equivalents
 * (bodyweight, resistance band, dumbbell) targeting the exact same muscle groups.
 * If insufficient exercises exist for a muscle, transfers available candidates and
 * reports insufficient muscle names.
 */
export function convertDayToHomeWorkout(
  day: ProgramDay,
  customExercises: Exercise[] = [],
  userInjuries: string[] = [],
  excludedExerciseIds: string[] = [],
): ProgramDay & { insufficientMuscles?: string[]; convertedCount?: number } {
  const allExercises = [...EXERCISES, ...customExercises].filter(
    (e) =>
      !excludedExerciseIds.includes(e.id) &&
      (!userInjuries.length ||
        !e.avoidForInjuries?.some((inj) => userInjuries.includes(inj))),
  )

  const homePool = allExercises.filter(isHomeFriendlyExercise)

  const usedToday = new Set<string>()
  const newExercises: ProgramExercise[] = []
  const insufficientMusclesSet = new Set<string>()
  let convertedCount = 0

  for (const pe of day.exercises) {
    const current = allExercises.find((e) => e.id === pe.exerciseId)
    if (!current) {
      newExercises.push(pe)
      continue
    }

    if (isHomeFriendlyExercise(current) && !usedToday.has(current.id)) {
      usedToday.add(current.id)
      newExercises.push(pe)
      continue
    }

    // Try finding exact sub-muscle candidate
    const candidates = homePool.filter(
      (e) =>
        e.category === current.category &&
        !usedToday.has(e.id) &&
        e.targetSubMuscleAr === current.targetSubMuscleAr,
    )

    const match = candidates[0]

    if (match) {
      usedToday.add(match.id)
      convertedCount++
      newExercises.push({
        ...pe,
        exerciseId: match.id,
      })
    } else {
      // Fallback: any available home exercise for this muscle category today
      const fallback = homePool.find(
        (e) => e.category === current.category && !usedToday.has(e.id),
      )
      if (fallback) {
        usedToday.add(fallback.id)
        convertedCount++
        newExercises.push({
          ...pe,
          exerciseId: fallback.id,
        })
      } else {
        // No more home exercises available targeting this muscle
        const muscleAr =
          MUSCLE_GROUP_LABELS[current.category] || current.category
        insufficientMusclesSet.add(muscleAr)
        newExercises.push(pe)
      }
    }
  }

  const resultDay: ProgramDay & {
    insufficientMuscles?: string[]
    convertedCount?: number
  } = {
    ...day,
    exercises: newExercises,
    insufficientMuscles: Array.from(insufficientMusclesSet),
    convertedCount,
  }

  return resultDay
}
