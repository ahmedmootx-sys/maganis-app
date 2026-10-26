/**
 * src/modules/workout/exerciseStore.ts
 *
 * Single source of truth for exercise data and overrides across all screens (Task H2.1).
 * Owns reactive override state, custom media in IndexedDB, and effective exercise selectors/hooks.
 */

import { useSyncExternalStore, useMemo } from 'react'
import type { Exercise } from '../shared/types.ts'
import { getExerciseById as getRawCatalogExercise } from './exercises.ts'
import {
  type EffectiveExercise,
  type ExerciseOverride,
  type OverrideMedia,
  type OverrideMediaKind,
  getAllExerciseOverrides,
  getExerciseOverride,
  selectEffectiveExercise,
  subscribeOverrides,
  notifyOverridesChanged,
  saveExerciseOverride,
  deleteExerciseOverride,
  resetAllOverrides,
  validateExerciseOverride,
  resizeUserImage,
  validateGifMagicBytes,
  validateExternalUrl,
  testExternalImageLoad,
  extractFirstFrame,
  MAX_USER_MEDIA_ITEMS,
  MAX_USER_MEDIA_TOTAL_BYTES,
} from './exerciseOverrides.ts'

export type {
  EffectiveExercise,
  ExerciseOverride,
  OverrideMedia,
  OverrideMediaKind,
}

export {
  getAllExerciseOverrides,
  getExerciseOverride,
  selectEffectiveExercise,
  subscribeOverrides,
  notifyOverridesChanged,
  saveExerciseOverride,
  deleteExerciseOverride,
  resetAllOverrides,
  validateExerciseOverride,
  resizeUserImage,
  validateGifMagicBytes,
  validateExternalUrl,
  testExternalImageLoad,
  extractFirstFrame,
  MAX_USER_MEDIA_ITEMS,
  MAX_USER_MEDIA_TOTAL_BYTES,
}

let snapshotVersion = 0
subscribeOverrides(() => {
  snapshotVersion++
})

function getVersionSnapshot(): number {
  return snapshotVersion
}

/**
 * Pure function to get effective exercise by ID.
 * Merges raw catalog exercise or custom exercise with active user overrides.
 */
export function getEffectiveExercise(
  exerciseId: string,
  customExercises: Exercise[] = [],
): EffectiveExercise | null {
  if (!exerciseId) return null
  const custom = customExercises.find((c) => c.id === exerciseId)
  const base = custom || getRawCatalogExercise(exerciseId)
  if (!base) return null
  return selectEffectiveExercise(base)
}

/**
 * React hook returning the reactive effective exercise for an ID.
 * Automatically updates when overrides, custom images, or IndexedDB changes.
 */
export function useEffectiveExercise(
  exerciseId?: string,
  customExercises: Exercise[] = [],
): EffectiveExercise | null {
  useSyncExternalStore(
    subscribeOverrides,
    getVersionSnapshot,
    getVersionSnapshot,
  )

  return useMemo(() => {
    if (!exerciseId) return null
    return getEffectiveExercise(exerciseId, customExercises)
  }, [exerciseId, customExercises, snapshotVersion]) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * React hook returning reactive effective exercises for a list of IDs.
 */
export function useEffectiveExercises(
  exerciseIds: string[],
  customExercises: Exercise[] = [],
): (EffectiveExercise | null)[] {
  useSyncExternalStore(
    subscribeOverrides,
    getVersionSnapshot,
    getVersionSnapshot,
  )

  return useMemo(() => {
    return exerciseIds.map((id) => getEffectiveExercise(id, customExercises))
  }, [exerciseIds, customExercises, snapshotVersion]) // eslint-disable-line react-hooks/exhaustive-deps
}
