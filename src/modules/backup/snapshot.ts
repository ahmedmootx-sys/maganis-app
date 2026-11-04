import { isNative } from '../../platform/runtime.ts'
import { appStorage } from '../../platform/storage.ts'
import { findRegistryEntry } from '../../platform/storageRegistry.ts'
import { CURRENT_SCHEMA_VERSION } from '../../platform/migrations.ts'
import { getAllMediaItems, setMediaItem } from '../../lib/indexedStorage.ts'
import { BackupImportSchema } from './backupStore.ts'
import type { BackupData } from '../shared/types.ts'

export interface ManifestKvEntry {
  byteLength: number
  sha256: string
}

export interface ManifestMediaEntry {
  bytes: number
  mime: string
  sha256: string
}

export interface SnapshotManifestCounts {
  profilePresent: boolean
  programDays: number
  sessions: number
  bodyLogEntries: number
  notes: number
  nutritionDays: number
  customMeals: number
  customFoods: number
  customExercises: number
  deletedExercises: number
  overrides: number
  mediaItems: number
}

export interface SnapshotManifest {
  kv: Record<string, ManifestKvEntry>
  media: Record<string, ManifestMediaEntry>
  counts: SnapshotManifestCounts
  excludedKeys: Array<{ key: string; reason: string }>
}

export interface MaganisSnapshotV2 {
  format: 'maganis-snapshot'
  exportVersion: 2
  appVersion: string
  schemaVersion: number
  createdAt: number
  source: 'web' | 'native'
  manifest: SnapshotManifest
  data: {
    kv: Record<string, string>
    media: Record<string, { mime: string; dataUrl: string }>
  }
}

export async function sha256String(str: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(str)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Deterministic fallback if Web Crypto is absent (e.g. lightweight node)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return 'checksum_' + Math.abs(h).toString(16)
}

function parseJsonSafe<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function computeManifestCounts(
  kv: Record<string, string>,
  media: Record<string, { mime: string; dataUrl: string }>,
): SnapshotManifestCounts {
  const profileRaw = kv['maganis:profile.active']
  const programRaw = parseJsonSafe<{ days?: unknown[] }>(
    kv['maganis:workout.program'],
    {},
  )
  const sessionsRaw = parseJsonSafe<unknown[]>(
    kv['maganis:tracking.sessions'],
    [],
  )
  const bodyLogRaw = parseJsonSafe<unknown[]>(
    kv['maganis:tracking.body-log'],
    [],
  )
  const notesRaw = parseJsonSafe<unknown[]>(kv['maganis:tracking.notes'], [])
  const customMealsRaw = parseJsonSafe<unknown[]>(
    kv['maganis:custom_meals'],
    [],
  )
  const customFoodsRaw = parseJsonSafe<unknown[]>(
    kv['maganis:custom_food_items'],
    [],
  )
  const customExRaw = parseJsonSafe<unknown[]>(
    kv['maganis:workout.custom-exercises'] || kv['maganis:custom_exercises'],
    [],
  )
  const deletedExRaw = parseJsonSafe<unknown[]>(
    kv['maganis:workout.deleted-exercises'] || kv['maganis:deleted_exercises'],
    [],
  )
  const overridesRaw = parseJsonSafe<Record<string, unknown>>(
    kv['maganis:exercise_overrides'],
    {},
  )

  let nutritionDays = 0
  for (const k of Object.keys(kv)) {
    if (k.startsWith('maganis:daily_nutrition_')) {
      nutritionDays++
    }
  }

  return {
    profilePresent: Boolean(profileRaw),
    programDays: Array.isArray(programRaw?.days) ? programRaw.days.length : 0,
    sessions: Array.isArray(sessionsRaw) ? sessionsRaw.length : 0,
    bodyLogEntries: Array.isArray(bodyLogRaw) ? bodyLogRaw.length : 0,
    notes: Array.isArray(notesRaw) ? notesRaw.length : 0,
    nutritionDays,
    customMeals: Array.isArray(customMealsRaw) ? customMealsRaw.length : 0,
    customFoods: Array.isArray(customFoodsRaw) ? customFoodsRaw.length : 0,
    customExercises: Array.isArray(customExRaw) ? customExRaw.length : 0,
    deletedExercises: Array.isArray(deletedExRaw) ? deletedExRaw.length : 0,
    overrides: Object.keys(overridesRaw).length,
    mediaItems: Object.keys(media).length,
  }
}

/**
 * Builds a complete, byte-for-byte verifiable Snapshot V2.
 */
export async function buildSnapshot(
  customKv?: Record<string, string>,
  customMedia?: Record<string, { mime: string; dataUrl: string }>,
): Promise<MaganisSnapshotV2> {
  const allKv = customKv ?? appStorage.getAll()
  let rawMedia: Record<string, unknown> = customMedia ?? {}
  if (!customMedia) {
    try {
      rawMedia = await getAllMediaItems()
    } catch {
      rawMedia = {}
    }
  }

  const snapshotKv: Record<string, string> = {}
  const kvManifest: Record<string, ManifestKvEntry> = {}
  const excludedKeys: Array<{ key: string; reason: string }> = []

  // Classify all KV keys
  for (const [k, v] of Object.entries(allKv)) {
    if (k.startsWith('idb:')) continue // Handled under media/idb section
    const entry = findRegistryEntry(k)
    if (entry && entry.snapshot === 'include') {
      snapshotKv[k] = v
      const hash = await sha256String(v)
      kvManifest[k] = {
        byteLength: new TextEncoder().encode(v).length,
        sha256: hash,
      }
    } else {
      excludedKeys.push({
        key: k,
        reason: entry?.reason ?? 'Not registered in storageRegistry',
      })
    }
  }

  // Media items
  const snapshotMedia: Record<string, { mime: string; dataUrl: string }> = {}
  const mediaManifest: Record<string, ManifestMediaEntry> = {}

  for (const [id, item] of Object.entries(rawMedia)) {
    if (item && typeof item === 'object') {
      const m = item as { mime?: string; dataUrl?: string }
      if (m.dataUrl) {
        const mime = m.mime || 'image/jpeg'
        const hash = await sha256String(m.dataUrl)
        snapshotMedia[id] = { mime, dataUrl: m.dataUrl }
        mediaManifest[id] = {
          bytes: m.dataUrl.length,
          mime,
          sha256: hash,
        }
      }
    }
  }

  const counts = computeManifestCounts(snapshotKv, snapshotMedia)

  return {
    format: 'maganis-snapshot',
    exportVersion: 2,
    appVersion: '0.1.0',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: Date.now(),
    source: isNative() ? 'native' : 'web',
    manifest: {
      kv: kvManifest,
      media: mediaManifest,
      counts,
      excludedKeys,
    },
    data: {
      kv: snapshotKv,
      media: snapshotMedia,
    },
  }
}

export interface SnapshotValidationResult {
  ok: boolean
  isV1Legacy: boolean
  warningAr?: string
  errorAr?: string
  counts: SnapshotManifestCounts
  snapshot?: MaganisSnapshotV2
  invalidKeys: Array<{ key: string; errors: string[] }>
}

/**
 * Validates a snapshot payload with strict envelope checks, manifest hashes,
 * and per-key schemas from the storage registry.
 */
export async function validateSnapshot(
  payload: unknown,
): Promise<SnapshotValidationResult> {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      isV1Legacy: false,
      errorAr: 'ملف النسخة الاحتياطية تالف أو ليس بتنسيق JSON صالح.',
      counts: computeManifestCounts({}, {}),
      invalidKeys: [],
    }
  }

  const raw = payload as Record<string, unknown>

  // 1. Handle V1 Legacy files
  if (raw.exportVersion === 1 || (!raw.format && raw.profile)) {
    const v1Parse = BackupImportSchema.safeParse(raw)
    if (!v1Parse.success) {
      return {
        ok: false,
        isV1Legacy: true,
        errorAr: 'ملف النسخة القديم (v1) غير مطابق للمواصفات المطلوبة.',
        counts: computeManifestCounts({}, {}),
        invalidKeys: [],
      }
    }
    const v1Data = v1Parse.data as unknown as BackupData
    // Upgrade v1 to V2 in-memory
    const upgradedKv: Record<string, string> = {}
    if (v1Data.profile)
      upgradedKv['maganis:profile.active'] = JSON.stringify(v1Data.profile)
    if (v1Data.workoutProgram)
      upgradedKv['maganis:workout.program'] = JSON.stringify(
        v1Data.workoutProgram,
      )
    if (v1Data.customExercises)
      upgradedKv['maganis:workout.custom-exercises'] = JSON.stringify(
        v1Data.customExercises,
      )
    if (v1Data.trackingSessions)
      upgradedKv['maganis:tracking.sessions'] = JSON.stringify(
        v1Data.trackingSessions,
      )
    if (v1Data.bodyLog)
      upgradedKv['maganis:tracking.body-log'] = JSON.stringify(v1Data.bodyLog)
    if (v1Data.dayNotes)
      upgradedKv['maganis:tracking.notes'] = JSON.stringify(v1Data.dayNotes)
    if (v1Data.exerciseOverrides)
      upgradedKv['maganis:exercise_overrides'] = JSON.stringify(
        v1Data.exerciseOverrides,
      )

    const v2Snapshot = await buildSnapshot(upgradedKv, {})
    return {
      ok: true,
      isV1Legacy: true,
      warningAr:
        'ملف النسخة من الإصدار القديم (v1). تم استيراد التمارين والجلسات والملف الشخصي بنجاح، ولكن هذا الملف لا يحتوي على سجلات التغذية أو الوجبات المخصصة أو وسائط التمارين.',
      counts: v2Snapshot.manifest.counts,
      snapshot: v2Snapshot,
      invalidKeys: [],
    }
  }

  // 2. Strict V2 Validation
  if (raw.format !== 'maganis-snapshot' || raw.exportVersion !== 2) {
    return {
      ok: false,
      isV1Legacy: false,
      errorAr: 'تنسيق ملف النسخة الاحتياطية غير مدعوم أو غير معروف.',
      counts: computeManifestCounts({}, {}),
      invalidKeys: [],
    }
  }

  const schemaVer = Number(raw.schemaVersion) || 1
  if (schemaVer > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      isV1Legacy: false,
      errorAr: `ملف النسخة تم إنشاؤه بإصدار أحدث من التطبيق (إصدار البنية: ${schemaVer}). يرجى تحديث التطبيق أولاً لإمكانية استيراده.`,
      counts: computeManifestCounts({}, {}),
      invalidKeys: [],
    }
  }

  const snapshot = raw as unknown as MaganisSnapshotV2
  const dataKv = snapshot.data?.kv || {}
  const manifestKv = snapshot.manifest?.kv || {}
  const invalidKeys: Array<{ key: string; errors: string[] }> = []

  // Check manifest hashes against raw KV
  for (const [k, v] of Object.entries(dataKv)) {
    const meta = manifestKv[k]
    if (meta && meta.sha256) {
      const computed = await sha256String(v)
      if (computed !== meta.sha256) {
        invalidKeys.push({
          key: k,
          errors: [`تطابق البصمة الرقمية (SHA-256) غير صحيح للمفتاح ${k}`],
        })
      }
    }

    // Per-key schema validation
    const entry = findRegistryEntry(k)
    if (entry && entry.schema) {
      try {
        const parsedJson = JSON.parse(v)
        const parseRes = entry.schema.safeParse(parsedJson)
        if (!parseRes.success) {
          invalidKeys.push({
            key: k,
            errors: parseRes.error.issues.map((i) => i.message),
          })
        }
      } catch {
        invalidKeys.push({
          key: k,
          errors: ['محتوى المفتاح ليس بتنسيق JSON صالح'],
        })
      }
    }
  }

  if (invalidKeys.length > 0) {
    return {
      ok: false,
      isV1Legacy: false,
      errorAr:
        `فشل التحقق من صحة بعض البيانات:\n• ` +
        invalidKeys
          .map((ik) => `${ik.key}: ${ik.errors.join(', ')}`)
          .join('\n• '),
      counts: snapshot.manifest.counts,
      snapshot,
      invalidKeys,
    }
  }

  return {
    ok: true,
    isV1Legacy: false,
    counts: snapshot.manifest.counts,
    snapshot,
    invalidKeys: [],
  }
}

/**
 * Transactionally applies a verified Snapshot V2 with automatic pre-restore
 * safety snapshot rollback (D2 & D4).
 */
export async function applySnapshot(snapshot: MaganisSnapshotV2): Promise<{
  success: boolean
  appliedCounts: SnapshotManifestCounts
  errorAr?: string
}> {
  // Step 1: Pre-restore Safety Snapshot
  const safetyBackupKv = appStorage.getAll()
  let safetyBackupMedia: Record<string, unknown> = {}
  try {
    safetyBackupMedia = await getAllMediaItems()
  } catch {
    // ignore
  }

  try {
    // Step 2: Apply KV data to appStorage
    for (const [k, v] of Object.entries(snapshot.data.kv)) {
      appStorage.setItem(k, v)
    }

    // Step 3: Apply Media data
    if (snapshot.data.media) {
      for (const [id, m] of Object.entries(snapshot.data.media)) {
        await setMediaItem(id, m)
      }
    }

    await appStorage.flush()

    // Step 4: Verification read-back (D4)
    for (const [k, meta] of Object.entries(snapshot.manifest.kv)) {
      const readVal = appStorage.getItem(k)
      if (readVal === null) {
        throw new Error(`قراءة المفتاح المستعاد ${k} أرجعت قيمة فارغة!`)
      }
      const readHash = await sha256String(readVal)
      if (readHash !== meta.sha256) {
        throw new Error(`عدم تطابق البصمة بعد الاستعادة للمفتاح ${k}`)
      }
    }

    return {
      success: true,
      appliedCounts: snapshot.manifest.counts,
    }
  } catch (err) {
    console.error('Snapshot apply failed, rolling back to safety backup:', err)
    // Rollback to safety backup
    try {
      appStorage.clear()
      for (const [k, v] of Object.entries(safetyBackupKv)) {
        appStorage.setItem(k, v)
      }
      if (safetyBackupMedia) {
        for (const [id, m] of Object.entries(safetyBackupMedia)) {
          await setMediaItem(id, m)
        }
      }
      await appStorage.flush()
    } catch (rollbackErr) {
      console.error('Critical: Safety snapshot rollback failed:', rollbackErr)
    }

    return {
      success: false,
      appliedCounts: computeManifestCounts({}, {}),
      errorAr: `فشلت استعادة النسخة الاحتياطية: ${String(err)}. تم التراجع واستعادة بياناتك السابقة بأمان.`,
    }
  }
}
