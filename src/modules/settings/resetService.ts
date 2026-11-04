/**
 * src/modules/settings/resetService.ts
 *
 * Implements reset with a keep-edits option and delete-all.
 * Provides statistics on user exercise edits and handles safe atomic factory resets:
 * - 'keep-edits': Preserves exercise overrides, media blobs, custom exercises, and deleted exercises list.
 * - 'delete-all': Truly wipes everything (appStorage, native KV, native media, caches, in-memory state).
 * - Notifies registered reset hooks (used by N4 to cancel scheduled notifications).
 */

import {
  getAllExerciseOverrides,
  resetAllOverrides,
} from '../workout/exerciseOverrides.ts'
import {
  getAllMediaItems,
  clearAllMaganisDB,
  setIndexedItem,
  setMediaItem,
} from '../../lib/indexedStorage.ts'
import { parseVideoUrl } from '../workout/videoUtils.ts'
import { plural } from '../../utils/plural.ts'
import type { CustomExercise } from '../shared/types.ts'
import { appStorage } from '../../platform/storage.ts'
import { isNative } from '../../platform/runtime.ts'
import { MaganisNative } from '../../platform/native/maganisNative.ts'

export type ResetHook = () => void | Promise<void>
const resetHooks: Set<ResetHook> = new Set()

/**
 * Registers a hook to run on factory reset (e.g. N4 notification cancellation).
 */
export function registerResetHook(hook: ResetHook): () => void {
  resetHooks.add(hook)
  return () => {
    resetHooks.delete(hook)
  }
}

export interface ExerciseEditsStats {
  modifiedCount: number
  imagesCount: number
  videosCount: number
  customExercisesCount: number
  deletedExercisesCount: number
  summaryText: string
}

export function getExerciseEditsStats(
  customExercises: CustomExercise[] = [],
  deletedExerciseIds: string[] = [],
): ExerciseEditsStats {
  const overrides = getAllExerciseOverrides()
  const overrideEntries = Object.values(overrides)

  const modifiedCount = overrideEntries.length
  let imagesCount = 0
  let videosCount = 0

  for (const o of overrideEntries) {
    if (
      o.media?.kind === 'upload-image' ||
      o.media?.kind === 'upload-gif' ||
      (o.imageMode === 'custom' && o.customImageBlob)
    ) {
      imagesCount++
    }
    if (o.videoUrl && parseVideoUrl(o.videoUrl).isValid) {
      videosCount++
    }
  }

  const customCount = customExercises.length
  const deletedCount = deletedExerciseIds.length

  const parts: string[] = []
  if (modifiedCount > 0) {
    parts.push(`${plural(modifiedCount, 'exercise')} معدّلة`)
  }
  if (imagesCount > 0) {
    parts.push(plural(imagesCount, 'image'))
  }
  if (videosCount > 0) {
    parts.push(plural(videosCount, 'video'))
  }
  if (customCount > 0) {
    parts.push(`${plural(customCount, 'exercise')} أضفتهم`)
  }

  const summaryText =
    parts.length > 0 ? parts.join('، ') : 'لا توجد تعديلات على التمارين'

  return {
    modifiedCount,
    imagesCount,
    videosCount,
    customExercisesCount: customCount,
    deletedExercisesCount: deletedCount,
    summaryText,
  }
}

export async function executeFactoryReset(
  mode: 'keep-edits' | 'delete-all',
): Promise<void> {
  // Execute all registered reset hooks (e.g. notifications cleanup)
  for (const hook of resetHooks) {
    try {
      await hook()
    } catch (err) {
      console.warn('Reset hook threw error:', err)
    }
  }

  if (mode === 'delete-all') {
    // 1. Wipe in-memory state
    await resetAllOverrides()

    // 2. Wipe appStorage
    appStorage.clear()
    await appStorage.flush()

    // 3. Wipe native stores if on native platform
    if (isNative()) {
      try {
        await MaganisNative.kvClear()
        const allMedia = await MaganisNative.mediaGetAll()
        for (const id of Object.keys(allMedia.items || {})) {
          await MaganisNative.mediaRemove({ id })
        }
      } catch (err) {
        console.warn('Native storage clear error:', err)
      }
    }

    // 4. Wipe IndexedDB
    try {
      await clearAllMaganisDB()
    } catch {
      // ignore
    }

    // 5. Wipe Caches
    if (typeof caches !== 'undefined') {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      } catch {
        // ignore
      }
    }

    // 6. Reload page to ensure clean initial state
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
    return
  }

  // mode === 'keep-edits'
  // Step 1: Read all edits data to keep (bridging modern and legacy keys)
  const overridesToKeep = getAllExerciseOverrides()
  const mediaToKeep = await getAllMediaItems()

  const customExercisesToKeep =
    appStorage.getItem('maganis:workout.custom-exercises') ||
    appStorage.getItem('maganis:custom_exercises')
  const deletedExercisesToKeep =
    appStorage.getItem('maganis:workout.deleted-exercises') ||
    appStorage.getItem('maganis:deleted_exercises')

  // Step 2: Wipe all app state
  appStorage.clear()
  await appStorage.flush()

  if (isNative()) {
    try {
      await MaganisNative.kvClear()
    } catch {
      // ignore
    }
  }

  try {
    await clearAllMaganisDB()
  } catch {
    // ignore
  }

  if (typeof caches !== 'undefined') {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    } catch {
      // ignore
    }
  }

  // Step 3: Restore kept edits back into appStorage and stores
  appStorage.setItem(
    'maganis:exercise_overrides',
    JSON.stringify(overridesToKeep),
  )

  if (customExercisesToKeep) {
    appStorage.setItem(
      'maganis:workout.custom-exercises',
      customExercisesToKeep,
    )
    appStorage.setItem('maganis:custom_exercises', customExercisesToKeep)
  }

  if (deletedExercisesToKeep) {
    appStorage.setItem(
      'maganis:workout.deleted-exercises',
      deletedExercisesToKeep,
    )
    appStorage.setItem('maganis:deleted_exercises', deletedExercisesToKeep)
  }

  // Restore into IndexedDB / native media
  await setIndexedItem('exercise_overrides', overridesToKeep)
  for (const [k, v] of Object.entries(mediaToKeep)) {
    if (v) {
      await setMediaItem(k, v)
    }
  }

  await appStorage.flush()

  // Step 4: Verify restored items
  const checkOv = appStorage.getItem('maganis:exercise_overrides')
  if (!checkOv) {
    throw new Error('فشل التحقق من استعادة تعديلات التمارين')
  }

  // Step 5: Reload page
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
