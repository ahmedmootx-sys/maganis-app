/**
 * src/modules/workout/exerciseOverrides.ts
 *
 * Implements Task G5-B4 & Task H2: Overrides and Media layer for exercises.
 * - Stores metadata in localStorage and IndexedDB (maganis_kv).
 * - Stores binary media (images/GIFs) exclusively in IndexedDB (maganis_media), keeping localStorage lightweight.
 * - Pure merge function `selectEffectiveExercise` computes effective exercise with hasVideo and hasCustomMedia flags.
 * - Reactive subscription mechanism notifying on changes and IndexedDB hydration.
 * - Strict validation, GIF magic bytes verification, first-frame extraction, and HTTPS external URL validation.
 */

import type { Exercise, ExerciseMuscleTarget } from '../shared/types.ts'
import {
  getIndexedItem,
  setIndexedItem,
  setMediaItem,
  removeMediaItem,
  getAllMediaItems,
} from '../../lib/indexedStorage.ts'
import { parseVideoUrl } from './videoUtils.ts'
import muscleNamesData from '../../data/muscle-names.json'

export type OverrideMediaKind =
  'upload-image' | 'upload-gif' | 'external-image' | 'external-gif'

export interface OverrideMedia {
  kind: OverrideMediaKind
  blobKey?: string // exercise id in maganis_media
  url?: string // external https URL
  updatedAt: number
}

export interface ExerciseOverride {
  exerciseId: string
  nameAr?: string
  nameEn?: string
  imageMode?: 'original' | 'none' | 'custom'
  customImageBlob?: string // legacy data URL
  media?: OverrideMedia
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
  hasVideo?: boolean
  hasCustomMedia?: boolean
  personalNote?: string
  videoUrl?: string
  baseExercise?: Exercise
  mediaOverride?: OverrideMedia
}

export const OVERRIDES_STORAGE_KEY = 'exercise_overrides'
export const MAX_USER_MEDIA_ITEMS = 25
export const MAX_USER_MEDIA_TOTAL_BYTES = 40 * 1024 * 1024 // 40 MB
export const MAX_USER_IMAGES = MAX_USER_MEDIA_ITEMS
export const MAX_USER_IMAGES_TOTAL_BYTES = MAX_USER_MEDIA_TOTAL_BYTES

// Known valid muscle IDs from muscle-names.json
const VALID_MUSCLE_IDS = new Set<string>(
  (muscleNamesData.muscles as { id: string }[]).map((m) => m.id),
)

// In-memory cache for synchronous read
let inMemoryOverrides: Record<string, ExerciseOverride> = {}
let inMemoryMedia: Record<
  string,
  { dataUrl?: string; firstFrameUrl?: string }
> = {}

// Subscribers
const subscribers = new Set<() => void>()

export function subscribeOverrides(listener: () => void): () => void {
  subscribers.add(listener)
  return () => {
    subscribers.delete(listener)
  }
}

export function notifyOverridesChanged(): void {
  subscribers.forEach((fn) => {
    try {
      fn()
    } catch {
      // ignore
    }
  })
}

// Synchronous bootstrap of metadata from localStorage
if (typeof localStorage !== 'undefined') {
  try {
    const raw = localStorage.getItem(`maganis:${OVERRIDES_STORAGE_KEY}`)
    if (raw) {
      inMemoryOverrides = JSON.parse(raw)
      // Normalize legacy overrides
      for (const [id, ov] of Object.entries(inMemoryOverrides)) {
        if (!ov.media && ov.imageMode === 'custom' && ov.customImageBlob) {
          ov.media = {
            kind: 'upload-image',
            blobKey: id,
            updatedAt: ov.updatedAt || Date.now(),
          }
          inMemoryMedia[id] = { dataUrl: ov.customImageBlob }
        }
      }
    }
  } catch {
    inMemoryOverrides = {}
  }
}

// Asynchronous background hydration from IndexedDB
if (typeof window !== 'undefined') {
  Promise.all([
    getIndexedItem<Record<string, ExerciseOverride>>(OVERRIDES_STORAGE_KEY),
    getAllMediaItems(),
  ])
    .then(([dbOverrides, dbMedia]) => {
      let changed = false
      if (dbOverrides && typeof dbOverrides === 'object') {
        inMemoryOverrides = { ...inMemoryOverrides, ...dbOverrides }
        changed = true
      }
      if (dbMedia && typeof dbMedia === 'object') {
        for (const [k, v] of Object.entries(dbMedia)) {
          if (v) {
            if (typeof v === 'string') {
              inMemoryMedia[k] = { dataUrl: v }
            } else if (typeof v === 'object') {
              inMemoryMedia[k] = v as {
                dataUrl?: string
                firstFrameUrl?: string
              }
            }
          }
        }
        changed = true
      }
      if (changed) {
        notifyOverridesChanged()
      }
    })
    .catch(() => {
      // offline or IDB unavailable
    })
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
 * Returns in-memory custom media for an exercise ID.
 */
export function getCustomExerciseMedia(
  exerciseId: string,
): { dataUrl?: string; firstFrameUrl?: string } | undefined {
  return inMemoryMedia[exerciseId]
}

/**
 * Saves or updates an exercise override.
 * Updates in-memory cache, localStorage, and IndexedDB.
 */
export async function saveExerciseOverride(
  override: ExerciseOverride,
  mediaPayload?: { dataUrl?: string; firstFrameUrl?: string },
): Promise<void> {
  const validation = validateExerciseOverride(override)
  if (!validation.valid) {
    throw new Error(validation.error || 'تعديل غير صالح')
  }

  // Quota verification
  if (
    override.media?.kind === 'upload-image' ||
    override.media?.kind === 'upload-gif' ||
    (override.imageMode === 'custom' && override.customImageBlob)
  ) {
    const activeMediaExercises = Object.entries(inMemoryOverrides).filter(
      ([id, o]) =>
        id !== override.exerciseId &&
        (o.media?.kind === 'upload-image' ||
          o.media?.kind === 'upload-gif' ||
          (o.imageMode === 'custom' && o.customImageBlob)),
    )

    if (activeMediaExercises.length >= MAX_USER_MEDIA_ITEMS) {
      throw new Error(
        `الحد الأقصى للوسائط المخصصة هو ${MAX_USER_MEDIA_ITEMS} عنصراً.`,
      )
    }

    let totalBytes = (mediaPayload?.dataUrl || override.customImageBlob || '')
      .length
    for (const [id] of activeMediaExercises) {
      const m = inMemoryMedia[id]
      if (m?.dataUrl) totalBytes += m.dataUrl.length
    }

    if (totalBytes > MAX_USER_MEDIA_TOTAL_BYTES) {
      throw new Error(
        'تم تجاوز الحد الأقصى للمساحة المسموح بها للوسائط (40 ميجابايت).',
      )
    }
  }

  const updated: ExerciseOverride = {
    ...override,
    updatedAt: Date.now(),
  }

  // Handle binary media storage in IndexedDB (not in localStorage)
  if (mediaPayload && mediaPayload.dataUrl) {
    inMemoryMedia[override.exerciseId] = mediaPayload
    await setMediaItem(override.exerciseId, mediaPayload)
  } else if (override.customImageBlob) {
    inMemoryMedia[override.exerciseId] = { dataUrl: override.customImageBlob }
    await setMediaItem(override.exerciseId, {
      dataUrl: override.customImageBlob,
    })
  }

  // If image mode is original or none, clear custom media
  if (override.imageMode === 'original' || override.imageMode === 'none') {
    delete inMemoryMedia[override.exerciseId]
    await removeMediaItem(override.exerciseId)
  }

  // Keep localStorage lightweight: strip large base64 data URLs from metadata
  const metadataToStore: ExerciseOverride = {
    ...updated,
  }
  if (
    metadataToStore.customImageBlob &&
    metadataToStore.customImageBlob.length > 512
  ) {
    delete metadataToStore.customImageBlob
  }

  inMemoryOverrides[override.exerciseId] = updated

  // Sync to localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const storageOverrides: Record<string, ExerciseOverride> = {}
      for (const [k, v] of Object.entries(inMemoryOverrides)) {
        const item = { ...v }
        if (item.customImageBlob && item.customImageBlob.length > 512) {
          delete item.customImageBlob
        }
        storageOverrides[k] = item
      }
      localStorage.setItem(
        `maganis:${OVERRIDES_STORAGE_KEY}`,
        JSON.stringify(storageOverrides),
      )
    }
  } catch (err) {
    console.warn('[exerciseOverrides] localStorage save failed:', err)
  }

  // Sync to IndexedDB
  await setIndexedItem(OVERRIDES_STORAGE_KEY, inMemoryOverrides)
  notifyOverridesChanged()
}

/**
 * Deletes an exercise override ("رجّع الأصلي").
 */
export async function deleteExerciseOverride(
  exerciseId: string,
): Promise<void> {
  if (inMemoryOverrides[exerciseId]) {
    delete inMemoryOverrides[exerciseId]
    delete inMemoryMedia[exerciseId]

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
    await removeMediaItem(exerciseId)
    notifyOverridesChanged()
  }
}

/**
 * Resets all overrides.
 */
export async function resetAllOverrides(): Promise<void> {
  inMemoryOverrides = {}
  inMemoryMedia = {}
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`maganis:${OVERRIDES_STORAGE_KEY}`)
    }
  } catch {
    // silent
  }
  await setIndexedItem(OVERRIDES_STORAGE_KEY, {})
  notifyOverridesChanged()
}

/**
 * Computes the effective exercise by merging catalog entry with user overrides.
 * Pure merge function used across the app.
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
    const baseVideoUrl = (base as Exercise & { videoUrl?: string }).videoUrl
    const hasVideo = Boolean(
      baseVideoUrl && parseVideoUrl(baseVideoUrl).isValid,
    )
    return {
      ...base,
      isModified: false,
      hasVideo,
      hasCustomMedia: false,
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

  // 3. Media & Image Resolution
  let imageUrl = base.imageUrl || base.image
  let thumbnailUrl = base.thumbnailUrl
  let media = base.media
  let gifUrl = base.gifUrl || base.gif
  let hasCustomMedia = false

  const cachedMedia = inMemoryMedia[base.id] || inMemoryMedia[base.key || '']

  if (override.imageMode === 'none') {
    isModified = true
    imageUrl = undefined
    thumbnailUrl = undefined
    media = undefined
    gifUrl = undefined
    hasCustomMedia = false
  } else if (override.media) {
    isModified = true
    hasCustomMedia = true
    media = undefined

    switch (override.media.kind) {
      case 'upload-image': {
        const dataUrl = cachedMedia?.dataUrl || override.customImageBlob
        imageUrl = dataUrl
        thumbnailUrl = dataUrl
        gifUrl = undefined
        break
      }
      case 'upload-gif': {
        const dataUrl = cachedMedia?.dataUrl || override.customImageBlob
        imageUrl = dataUrl
        gifUrl = dataUrl
        thumbnailUrl = cachedMedia?.firstFrameUrl || dataUrl
        break
      }
      case 'external-image': {
        imageUrl = override.media.url
        thumbnailUrl = override.media.url
        gifUrl = undefined
        break
      }
      case 'external-gif': {
        imageUrl = override.media.url
        gifUrl = override.media.url
        thumbnailUrl = override.media.url
        break
      }
    }
  } else if (
    override.imageMode === 'custom' &&
    (override.customImageBlob || cachedMedia?.dataUrl)
  ) {
    isModified = true
    hasCustomMedia = true
    const dataUrl = cachedMedia?.dataUrl || override.customImageBlob
    imageUrl = dataUrl
    thumbnailUrl = dataUrl
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

  const videoUrl =
    override.videoUrl !== undefined
      ? override.videoUrl
      : (base as Exercise & { videoUrl?: string }).videoUrl
  if (override.videoUrl) isModified = true
  const hasVideo = Boolean(videoUrl && parseVideoUrl(videoUrl).isValid)

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
    hasVideo,
    hasCustomMedia,
    mediaOverride: override.media,
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
 * Validates GIF magic bytes ('GIF87a' or 'GIF89a')
 */
export async function validateGifMagicBytes(
  fileOrBlob: Blob,
): Promise<boolean> {
  try {
    const buffer = await fileOrBlob.slice(0, 6).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const header = String.fromCharCode(...bytes)
    return header === 'GIF87a' || header === 'GIF89a'
  } catch {
    return false
  }
}

/**
 * Extracts a static first frame of an animated GIF or image for list views.
 */
export async function extractFirstFrame(fileOrBlob: Blob): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return ''
  }
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(fileOrBlob)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      const targetWidth = Math.min(img.width || 320, 320)
      const ratio = targetWidth / (img.width || 320)
      canvas.width = targetWidth
      canvas.height = Math.round((img.height || 320) * ratio)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      } else {
        resolve('')
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('')
    }
    img.src = url
  })
}

/**
 * Validates external image/GIF URLs (https only, no credentials, max 2048 chars).
 */
export function validateExternalUrl(urlStr: string): {
  valid: boolean
  error?: string
} {
  if (!urlStr || typeof urlStr !== 'string') {
    return { valid: false, error: 'الرابط غير صالح' }
  }
  const trimmed = urlStr.trim()
  if (trimmed.length > 2048) {
    return { valid: false, error: 'الرابط طويل جداً (الحد الأقصى 2048 حرف)' }
  }
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'لازم الرابط يبدأ بـ https://' }
    }
    if (parsed.username || parsed.password) {
      return { valid: false, error: 'الرابط لا يجب أن يحتوي على بيانات اعتماد' }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'صيغة الرابط غير صحيحة' }
  }
}

/**
 * Validates that an external image actually loads without HTTP errors.
 */
export function testExternalImageLoad(
  url: string,
  timeoutMs = 10000,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(true)
      return
    }
    const img = new Image()
    const timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      img.src = ''
      resolve(false)
    }, timeoutMs)

    img.onload = () => {
      if (timer) clearTimeout(timer)
      resolve(true)
    }
    img.onerror = () => {
      if (timer) clearTimeout(timer)
      resolve(false)
    }
    img.referrerPolicy = 'no-referrer'
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

  if (o.media !== undefined) {
    if (!o.media || typeof o.media !== 'object') {
      return { valid: false, error: 'بيانات الوسائط غير صالحة' }
    }
    const m = o.media as Record<string, unknown>
    const validKinds: OverrideMediaKind[] = [
      'upload-image',
      'upload-gif',
      'external-image',
      'external-gif',
    ]
    if (!validKinds.includes(m.kind as OverrideMediaKind)) {
      return { valid: false, error: 'نوع الوسائط غير مدعوم' }
    }
    if (
      (m.kind === 'external-image' || m.kind === 'external-gif') &&
      typeof m.url === 'string'
    ) {
      const urlCheck = validateExternalUrl(m.url)
      if (!urlCheck.valid) {
        return { valid: false, error: urlCheck.error }
      }
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
