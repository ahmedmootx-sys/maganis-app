/**
 * src/modules/settings/resetService.ts
 *
 * Implements Task H2.4: Reset with a keep-edits option.
 * Provides statistics on user exercise edits and handles safe atomic factory resets:
 * - 'keep-edits': Preserves exercise overrides, media blobs, custom exercises, and deleted exercises list.
 *   Follows strict order of operations: read -> write to temp IDB -> wipe all -> restore -> verify -> delete temp -> reload.
 * - 'delete-all': Truly wipes everything (localStorage, sessionStorage, maganis_db, caches, in-memory state).
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
  if (mode === 'delete-all') {
    // 1. Wipe in-memory state
    await resetAllOverrides()

    // 2. Wipe localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.clear()
      } catch {
        // ignore
      }
    }

    // 3. Wipe sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.clear()
      } catch {
        // ignore
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

    // 6. Reload page to ensure clean state
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
    return
  }

  // mode === 'keep-edits'
  // Step 1: Read data to keep
  const overridesToKeep = getAllExerciseOverrides()
  const mediaToKeep = await getAllMediaItems()
  let customExercisesToKeep: string | null = null
  let deletedExercisesToKeep: string | null = null

  if (typeof localStorage !== 'undefined') {
    customExercisesToKeep = localStorage.getItem('maganis:custom_exercises')
    deletedExercisesToKeep = localStorage.getItem('maganis:deleted_exercises')
  }

  // Step 2: Write to temporary IndexedDB store
  const TEMP_DB_NAME = 'maganis_temp_restore'
  const TEMP_STORE_NAME = 'temp_keep'

  await new Promise<void>((resolve, reject) => {
    try {
      const req = indexedDB.open(TEMP_DB_NAME, 1)
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(TEMP_STORE_NAME)) {
          db.createObjectStore(TEMP_STORE_NAME)
        }
      }
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction(TEMP_STORE_NAME, 'readwrite')
        const store = tx.objectStore(TEMP_STORE_NAME)
        store.put(overridesToKeep, 'overrides')
        store.put(mediaToKeep, 'media')
        store.put(customExercisesToKeep, 'custom_exercises')
        store.put(deletedExercisesToKeep, 'deleted_exercises')
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => {
          db.close()
          reject(new Error('فشل في حفظ البيانات المؤقتة قبل المسح'))
        }
      }
      req.onerror = () => {
        reject(new Error('تعذر فتح قاعدة البيانات المؤقتة'))
      }
    } catch (err) {
      reject(err)
    }
  })

  // Step 3: Wipe all app state
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  }

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.clear()
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

  // Step 4: Restore from temporary store
  const restored = await new Promise<{
    overrides: Record<string, unknown>
    media: Record<string, unknown>
    custom_exercises: string | null
    deleted_exercises: string | null
  }>((resolve, reject) => {
    try {
      const req = indexedDB.open(TEMP_DB_NAME, 1)
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction(TEMP_STORE_NAME, 'readonly')
        const store = tx.objectStore(TEMP_STORE_NAME)

        const getOverrides = store.get('overrides')
        const getMedia = store.get('media')
        const getCustom = store.get('custom_exercises')
        const getDeleted = store.get('deleted_exercises')

        tx.oncomplete = () => {
          db.close()
          resolve({
            overrides: (getOverrides.result || {}) as Record<string, unknown>,
            media: (getMedia.result || {}) as Record<string, unknown>,
            custom_exercises: getCustom.result as string | null,
            deleted_exercises: getDeleted.result as string | null,
          })
        }
        tx.onerror = () => {
          db.close()
          reject(new Error('فشل في قراءة البيانات من النسخة المؤقتة'))
        }
      }
      req.onerror = () => {
        reject(new Error('تعذر فتح النسخة المؤقتة للاسترجاع'))
      }
    } catch (err) {
      reject(err)
    }
  })

  // Restore into target stores
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(
      'maganis:exercise_overrides',
      JSON.stringify(restored.overrides),
    )
    if (restored.custom_exercises) {
      localStorage.setItem(
        'maganis:custom_exercises',
        restored.custom_exercises,
      )
    }
    if (restored.deleted_exercises) {
      localStorage.setItem(
        'maganis:deleted_exercises',
        restored.deleted_exercises,
      )
    }
  }

  // Restore into IndexedDB maganis_kv and maganis_media
  await setIndexedItem('exercise_overrides', restored.overrides)
  for (const [k, v] of Object.entries(restored.media)) {
    if (v) {
      await setMediaItem(k, v)
    }
  }

  // Step 5: Verify restored items
  if (typeof localStorage !== 'undefined') {
    const checkOv = localStorage.getItem('maganis:exercise_overrides')
    if (!checkOv) {
      throw new Error('فشل التحقق من استعادة تعديلات التمارين')
    }
  }

  // Step 6: Delete temporary DB
  try {
    indexedDB.deleteDatabase(TEMP_DB_NAME)
  } catch {
    // ignore
  }

  // Step 7: Reload page
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
