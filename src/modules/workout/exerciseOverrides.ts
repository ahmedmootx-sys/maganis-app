/**
 * src/modules/workout/exerciseOverrides.ts
 *
 * Implements Task G5-B4: Overrides layer for exercises.
 * - Stores user edits in IndexedDB and localStorage (mirrored for synchronous access).
 * - Catalog is never mutated.
 * - `selectEffectiveExercise` single selector computes effective exercise at read time.
 * - Canvas image resizer (max 640px on long side, strips EXIF, 10 images / 5MB limit).
 * - Strict validation for backup/export/import.
 */

import type { Exercise, ExerciseMuscleTarget } from '../shared/types.ts'
import { getIndexedItem, setIndexedItem } from '../../lib/indexedStorage.ts'
import { parseVideoUrl } from './videoUtils.ts'
import muscleNamesData from '../../data/muscle-names.json'

export interface ExerciseOverride {
  exerciseId: string
  nameAr?: string
  nameEn?: string
  imageMode?: 'original' | 'none' | 'custom'
  customImageBlob?: string // data URL
  benefitAr?: string
  mechanicsAr?: string
  howToStepsAr?: string[]
  muscles?: ExerciseMuscleTarget[]
  personalNote?: string // max 500 chars
  videoUrl?: string
  updatedAt?: number
}

export type EffectiveExercise = Exercise & {
  isModified?: boolean
  personalNote?: string
  videoUrl?: string
  baseExercise?: Exercise
}

export const OVERRIDES_STORAGE_KEY = 'exercise_overrides'
export const MAX_USER_IMAGES = 10
export const MAX_USER_IMAGES_TOTAL_BYTES = 5 * 1024 * 1024 // 5 MB

// Known valid muscle IDs from muscle-names.json
const VALID_MUSCLE_IDS = new Set<string>(
  (muscleNamesData.muscles as { id: string }[]).map((m) => m.id),
)

// In-memory cache for synchronous read by React components
let inMemoryOverrides: Record<string, ExerciseOverride> = {}

// Synchronous bootstrap from localStorage
if (typeof localStorage !== 'undefined') {
  try {
    const raw = localStorage.getItem(`maganis:${OVERRIDES_STORAGE_KEY}`)
    if (raw) {
      inMemoryOverrides = JSON.parse(raw)
    }
  } catch {
    inMemoryOverrides = {}
  }
}

// Background sync from IndexedDB
if (typeof window !== 'undefined') {
  getIndexedItem<Record<string, ExerciseOverride>>(OVERRIDES_STORAGE_KEY).then(
    (data) => {
      if (data && typeof data === 'object') {
        inMemoryOverrides = { ...inMemoryOverrides, ...data }
      }
    },
  )
}

/**
 * Returns all active exercise overrides.
 */
export function getAllExerciseOverrides(): Record<string, ExerciseOverride> {
  return { ...inMemoryOverrides }
}

/**
 * Returns the override for a specific exercise ID.
 */
export function getExerciseOverride(
  exerciseId: string,
): ExerciseOverride | undefined {
  return inMemoryOverrides[exerciseId]
}

/**
 * Saves or updates an exercise override.
 * Updates in-memory cache, localStorage, and IndexedDB.
 */
export async function saveExerciseOverride(
  override: ExerciseOverride,
): Promise<void> {
  const validation = validateExerciseOverride(override)
  if (!validation.valid) {
    throw new Error(validation.error || 'تعديل غير صالح')
  }

  // Check quota if adding/updating custom image
  if (override.imageMode === 'custom' && override.customImageBlob) {
    const current = inMemoryOverrides[override.exerciseId]
    const isNewImage = !current?.customImageBlob

    const currentImageCount = Object.values(inMemoryOverrides).filter(
      (o) => o.exerciseId !== override.exerciseId && o.customImageBlob,
    ).length

    if (isNewImage && currentImageCount >= MAX_USER_IMAGES) {
      throw new Error(
        `تم الوصول إلى الحد الأقصى للصور (${MAX_USER_IMAGES} صور كحد أقصى).`,
      )
    }

    // Compute total image bytes
    let totalBytes = (override.customImageBlob || '').length
    for (const [id, o] of Object.entries(inMemoryOverrides)) {
      if (id !== override.exerciseId && o.customImageBlob) {
        totalBytes += o.customImageBlob.length
      }
    }

    if (totalBytes > MAX_USER_IMAGES_TOTAL_BYTES) {
      throw new Error(
        'تم تجاوز الحد الأقصى للمساحة المسموح بها للصور (5 ميجابايت).',
      )
    }
  }

  const updated: ExerciseOverride = {
    ...override,
    updatedAt: Date.now(),
  }

  inMemoryOverrides[override.exerciseId] = updated

  // Sync to localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        `maganis:${OVERRIDES_STORAGE_KEY}`,
        JSON.stringify(inMemoryOverrides),
      )
    }
  } catch (err) {
    console.warn('[exerciseOverrides] localStorage save failed:', err)
  }

  // Sync to IndexedDB
  await setIndexedItem(OVERRIDES_STORAGE_KEY, inMemoryOverrides)
}

/**
 * Deletes an exercise override ("رجّع الأصلي").
 */
export async function deleteExerciseOverride(
  exerciseId: string,
): Promise<void> {
  if (inMemoryOverrides[exerciseId]) {
    delete inMemoryOverrides[exerciseId]

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `maganis:${OVERRIDES_STORAGE_KEY}`,
          JSON.stringify(inMemoryOverrides),
        )
      }
    } catch {
      // silent
    }

    await setIndexedItem(OVERRIDES_STORAGE_KEY, inMemoryOverrides)
  }
}

/**
 * Resets all overrides.
 */
export async function resetAllOverrides(): Promise<void> {
  inMemoryOverrides = {}
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`maganis:${OVERRIDES_STORAGE_KEY}`)
    }
  } catch {
    // silent
  }
  await setIndexedItem(OVERRIDES_STORAGE_KEY, {})
}

/**
 * Computes the effective exercise by merging catalog entry with user overrides.
 * This is the SINGLE SELECTOR used across all screens.
 */
export function selectEffectiveExercise(
  base: Exercise,
  overrideParam?: ExerciseOverride,
): EffectiveExercise {
  const override =
    overrideParam ||
    inMemoryOverrides[base.id] ||
    inMemoryOverrides[base.key || '']

  if (!override) {
    return {
      ...base,
      isModified: false,
      baseExercise: base,
    }
  }

  let isModified = false

  // 1. Arabic Name
  const effectiveNameAr =
    override.nameAr !== undefined && override.nameAr.trim() !== ''
      ? ((isModified = true), override.nameAr.trim())
      : base.nameAr

  // 2. English Name
  const effectiveNameEn =
    override.nameEn !== undefined
      ? ((isModified = true), override.nameEn.trim())
      : base.nameEn || base.name

  // 3. Image
  let imageUrl = base.imageUrl || base.image
  let thumbnailUrl = base.thumbnailUrl
  let media = base.media
  let gifUrl = base.gifUrl || base.gif

  if (override.imageMode === 'none') {
    isModified = true
    imageUrl = undefined
    thumbnailUrl = undefined
    media = undefined
    gifUrl = undefined
  } else if (override.imageMode === 'custom' && override.customImageBlob) {
    isModified = true
    imageUrl = override.customImageBlob
    thumbnailUrl = override.customImageBlob
    media = undefined
    gifUrl = undefined
  }

  // 4. How to perform
  const benefitAr =
    override.benefitAr !== undefined
      ? ((isModified = true), override.benefitAr)
      : base.benefitAr || base.benefit

  const mechanicsAr =
    override.mechanicsAr !== undefined
      ? ((isModified = true), override.mechanicsAr)
      : base.mechanicsAr || base.mechanics

  const howToStepsAr =
    override.howToStepsAr !== undefined
      ? ((isModified = true), override.howToStepsAr)
      : base.howToStepsAr || base.steps || base.steps_ar

  // 5. Muscles
  const muscles =
    override.muscles !== undefined
      ? ((isModified = true), override.muscles)
      : base.muscles

  // 6. Personal Note
  const personalNote = override.personalNote
  if (personalNote) isModified = true

  // 7. Video URL
  const videoUrl = override.videoUrl
  if (videoUrl) isModified = true

  return {
    ...base,
    nameAr: effectiveNameAr,
    name: effectiveNameAr,
    nameEn: effectiveNameEn,
    imageUrl,
    thumbnailUrl,
    media,
    gifUrl,
    benefitAr,
    mechanicsAr,
    howToStepsAr,
    muscles,
    personalNote,
    videoUrl,
    isModified,
    baseExercise: base,
  }
}

/**
 * Resizes a user image to at most 640px on the longest side using an HTMLCanvasElement.
 * This also naturally strips EXIF data. Never upscales images.
 */
export function resizeUserImage(fileOrBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
      // In non-browser environment, fallback to reading as data URL
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(fileOrBlob)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(fileOrBlob)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX_SIDE = 640
      let { width, height } = img

      if (width > MAX_SIDE || height > MAX_SIDE) {
        if (width >= height) {
          height = Math.round((height * MAX_SIDE) / width)
          width = MAX_SIDE
        } else {
          width = Math.round((width * MAX_SIDE) / height)
          height = MAX_SIDE
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('تعذر إنشاء سياق رسم للصور'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)
      // Export as JPEG with good quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('فشل في تحميل الصورة'))
    }

    img.src = url
  })
}

/**
 * Validates an exercise override object during creation or backup import.
 */
export function validateExerciseOverride(obj: unknown): {
  valid: boolean
  error?: string
} {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { valid: false, error: 'بيانات التعديل غير صالحة' }
  }

  const o = obj as Record<string, unknown>

  if (typeof o.exerciseId !== 'string' || !o.exerciseId.trim()) {
    return { valid: false, error: 'معرف التمرين مطلوب وغير صالح' }
  }

  if (o.nameAr !== undefined && typeof o.nameAr !== 'string') {
    return { valid: false, error: 'الاسم العربي لازم يكون نص' }
  }

  if (o.nameEn !== undefined && typeof o.nameEn !== 'string') {
    return { valid: false, error: 'الاسم الإنجليزي لازم يكون نص' }
  }

  if (o.personalNote !== undefined) {
    if (typeof o.personalNote !== 'string') {
      return { valid: false, error: 'الملاحظة الشخصية لازم تكون نص' }
    }
    if (o.personalNote.length > 500) {
      return {
        valid: false,
        error: 'الملاحظة الشخصية متعديش 500 حرف',
      }
    }
  }

  if (o.howToStepsAr !== undefined) {
    if (
      !Array.isArray(o.howToStepsAr) ||
      o.howToStepsAr.some((s) => typeof s !== 'string')
    ) {
      return { valid: false, error: 'خطوات الأداء لازم تكون قايمة نصوص' }
    }
  }

  if (o.muscles !== undefined) {
    if (!Array.isArray(o.muscles)) {
      return { valid: false, error: 'بيانات العضلات المستهدفة غير صالحة' }
    }
    for (const m of o.muscles as ExerciseMuscleTarget[]) {
      if (!m || typeof m !== 'object') {
        return { valid: false, error: 'عنصر عضلي غير صالح' }
      }
      if (m.role !== 'primary' && m.role !== 'secondary') {
        return { valid: false, error: 'دور العضلة لازم يكون رئيسي أو مساعد' }
      }
      if (!m.id || typeof m.id !== 'string') {
        return { valid: false, error: 'معرف العضلة غير صالح' }
      }
      // Check that muscle exists in anatomical atlas
      if (!VALID_MUSCLE_IDS.has(m.id)) {
        return {
          valid: false,
          error: `معرف العضلة "${m.id}" غير موجود في الأطلس`,
        }
      }
    }
  }

  if (
    o.videoUrl !== undefined &&
    typeof o.videoUrl === 'string' &&
    o.videoUrl.trim() !== ''
  ) {
    const parsed = parseVideoUrl(o.videoUrl)
    if (!parsed.isValid) {
      return { valid: false, error: `رابط الفيديو غير صالح: ${parsed.error}` }
    }
  }

  if (o.imageMode !== undefined) {
    if (
      o.imageMode !== 'original' &&
      o.imageMode !== 'none' &&
      o.imageMode !== 'custom'
    ) {
      return { valid: false, error: 'وضع الصورة غير صالح' }
    }
  }

  if (
    o.customImageBlob !== undefined &&
    typeof o.customImageBlob !== 'string'
  ) {
    return { valid: false, error: 'بيانات الصورة المخصصة غير صالحة' }
  }

  return { valid: true }
}
