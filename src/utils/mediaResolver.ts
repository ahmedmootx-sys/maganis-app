import type { Exercise } from '../modules/shared/types.ts'
import { EXERCISES, getExerciseById } from '../modules/workout/exercises.ts'
import { assetUrl } from './assetUrl.ts'
import mediaFramesData from '../data/media-frames.json'

export interface ResolvedMedia {
  url: string | null
  frame1Url: string | null
  isKeyframed: boolean
}

interface FrameItem {
  index: number
  url: string
  label?: string
}

interface ExerciseFramesEntry {
  exerciseKey: string
  matchedName?: string
  frameCount: number
  frames: FrameItem[]
  startFrame?: number
  endFrame?: number
}

const framesDb = (mediaFramesData as unknown as {
  exercises: Record<string, ExerciseFramesEntry>
}).exercises || {}

/**
 * Single source of truth for resolving exercise media / thumbnails.
 * Used identically across:
 * - Day lists (WeeklyPlanView)
 * - Library rows (ExerciseLibraryView)
 * - Add-to-day sheet (ExerciseSelectSheet / ExercisePickerModal)
 * - Active session (ActiveWorkoutSession)
 * - History (SessionLogger / ProgressScreen)
 * - Exercise page (ExerciseDetailView)
 */
export function resolveMedia(
  exerciseOrId: Exercise | Partial<Exercise> | string | null | undefined,
  customExercises: Exercise[] = [],
): ResolvedMedia {
  if (!exerciseOrId) {
    return { url: null, frame1Url: null, isKeyframed: false }
  }

  let exercise: Partial<Exercise> | null = null
  let exId = ''

  if (typeof exerciseOrId === 'string') {
    exId = exerciseOrId
    exercise =
      customExercises.find((c) => c.id === exId) ||
      getExerciseById(exId) ||
      null
  } else {
    exercise = exerciseOrId
    exId = exercise.id || ''
  }

  // 1. Check local keyframed exercises from media-frames.json
  if (exId && framesDb[exId] && Array.isArray(framesDb[exId].frames)) {
    const entry = framesDb[exId]
    const f0 = entry.frames[0]?.url
    const f1 = entry.frames[1]?.url

    if (f0) {
      const cleanF0 = f0.startsWith('/') ? f0.slice(1) : f0
      const cleanF1 = f1 ? (f1.startsWith('/') ? f1.slice(1) : f1) : null

      return {
        url: assetUrl(cleanF0),
        frame1Url: cleanF1 ? assetUrl(cleanF1) : null,
        isKeyframed: Boolean(cleanF1 && cleanF0 !== cleanF1),
      }
    }
  }

  // 2. Check exercise object media properties
  if (exercise) {
    const candidate =
      exercise.thumbnailUrl ||
      exercise.imageUrl ||
      exercise.image ||
      exercise.gifUrl

    if (candidate && typeof candidate === 'string' && candidate.trim()) {
      const trimmed = candidate.trim()
      let f1: string | null = null

      if (trimmed.endsWith('/0.jpg')) {
        f1 = trimmed.replace(/\/0\.jpg$/i, '/1.jpg')
      } else if (trimmed.endsWith('_0.jpg')) {
        f1 = trimmed.replace(/_0\.jpg$/i, '_1.jpg')
      }

      const finalUrl =
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:')
          ? trimmed
          : assetUrl(trimmed.startsWith('/') ? trimmed.slice(1) : trimmed)

      const finalF1 = f1
        ? f1.startsWith('http://') ||
          f1.startsWith('https://') ||
          f1.startsWith('data:')
          ? f1
          : assetUrl(f1.startsWith('/') ? f1.slice(1) : f1)
        : null

      return {
        url: finalUrl,
        frame1Url: finalF1,
        isKeyframed: Boolean(finalF1 && finalUrl !== finalF1),
      }
    }
  }

  // 3. Fallback: null
  return {
    url: null,
    frame1Url: null,
    isKeyframed: false,
  }
}

/**
 * Returns all exercises from the library that have no visual media available.
 */
export function getNullMediaExercises(
  customExercises: Exercise[] = [],
): Exercise[] {
  const all = [...EXERCISES, ...customExercises]
  return all.filter((ex) => resolveMedia(ex, customExercises).url === null)
}
