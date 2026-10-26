import type { Exercise } from '../modules/shared/types.ts'
import { EXERCISES } from '../modules/workout/exercises.ts'
import { assetUrl } from './assetUrl.ts'
import mediaFramesData from '../data/media-frames.json' with { type: 'json' }

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

const framesDb =
  (
    mediaFramesData as unknown as {
      exercises: Record<string, ExerciseFramesEntry>
    }
  ).exercises || {}

/**
 * Single source of truth for resolving exercise media / thumbnails.
 * Task H2.1: Must take an effective exercise only (or custom exercise object).
 * The string ID path that bypassed overrides has been removed.
 *
 * Precedence:
 * 1. User's override media first (also when catalog has media)
 * 2. Catalog verified media (exact match only; "nearest" is never shown)
 * 3. Local keyframed exercises from media-frames.json
 * 4. Local or verified external image properties (https: allowed)
 * 5. Explicit null
 */
export function resolveMedia(
  exercise: Exercise | Partial<Exercise> | null | undefined,
): ResolvedMedia {
  if (!exercise) {
    return { url: null, frame1Url: null, isKeyframed: false }
  }

  const exId = exercise.id || exercise.key || ''
  const ex = exercise as Exercise & {
    hasCustomMedia?: boolean
    isModified?: boolean
    mediaOverride?: { kind: string; url?: string }
    imageMode?: string
  }

  // 1. User's override media first (Task H2.2 precedence)
  if (ex.hasCustomMedia || ex.mediaOverride) {
    const candidate = ex.gifUrl || ex.imageUrl || ex.thumbnailUrl
    if (candidate && typeof candidate === 'string' && candidate.trim()) {
      const isGif =
        ex.mediaOverride?.kind === 'upload-gif' ||
        ex.mediaOverride?.kind === 'external-gif' ||
        candidate.endsWith('.gif') ||
        candidate.startsWith('data:image/gif')

      return {
        url: candidate,
        frame1Url: isGif && ex.thumbnailUrl ? ex.thumbnailUrl : null,
        isKeyframed: false,
      }
    }
  }

  // If user explicitly removed image (imageMode: 'none')
  if (ex.isModified && ex.imageMode === 'none') {
    return { url: null, frame1Url: null, isKeyframed: false }
  }

  // 2. Check catalog-v1 verified media
  if (exercise.media) {
    const key = exercise.key || exId
    if (
      exercise.media.gif?.display === true &&
      exercise.media.gif?.match === 'exact'
    ) {
      return {
        url: assetUrl(`media/${key}/animation.gif`),
        frame1Url: assetUrl(`media/${key}/start.jpg`),
        isKeyframed: false,
      }
    }
    if (
      exercise.media.frames?.display === true &&
      exercise.media.frames?.match === 'exact'
    ) {
      return {
        url: assetUrl(`media/${key}/start.jpg`),
        frame1Url: assetUrl(`media/${key}/peak.jpg`),
        isKeyframed: true,
      }
    }
    // "nearest means a different movement: never shown"
    return {
      url: null,
      frame1Url: null,
      isKeyframed: false,
    }
  }

  // 3. Check local keyframed exercises from media-frames.json
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

  // 4. Check local/custom exercise media properties (local assets, data URIs, or https: URLs)
  const candidate =
    exercise.thumbnailUrl ||
    exercise.imageUrl ||
    exercise.image ||
    exercise.gifUrl

  if (candidate && typeof candidate === 'string' && candidate.trim()) {
    const trimmed = candidate.trim()

    // Disallow insecure http: URLs, but allow secure https: and data: and local paths
    if (!trimmed.startsWith('http://')) {
      if (trimmed.startsWith('https://')) {
        return {
          url: trimmed,
          frame1Url: null,
          isKeyframed: false,
        }
      }

      let f1: string | null = null
      if (trimmed.endsWith('/0.jpg')) {
        f1 = trimmed.replace(/\/0\.jpg$/i, '/1.jpg')
      } else if (trimmed.endsWith('_0.jpg')) {
        f1 = trimmed.replace(/_0\.jpg$/i, '_1.jpg')
      }

      const cleanF0 = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed
      const cleanF1 = f1 ? (f1.startsWith('/') ? f1.slice(1) : f1) : null

      return {
        url: trimmed.startsWith('data:') ? trimmed : assetUrl(cleanF0),
        frame1Url: cleanF1 ? assetUrl(cleanF1) : null,
        isKeyframed: Boolean(cleanF1 && cleanF0 !== cleanF1),
      }
    }
  }

  // 5. Fallback: explicit null
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
  return all.filter((ex) => resolveMedia(ex).url === null)
}
