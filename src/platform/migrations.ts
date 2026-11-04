import { appStorage } from './storage.ts'
import { setStorageHealthReadonly } from './storageHealth.ts'

export const CURRENT_SCHEMA_VERSION = 2
export const SCHEMA_VERSION_KEY = 'maganis:schema_version'

export interface Migration {
  fromVersion: number
  toVersion: number
  name: string
  migrate: (storage: typeof appStorage) => void | Promise<void>
}

/**
 * Registered migrations list.
 * Each migration is a pure deterministic function.
 */
export const MIGRATIONS: readonly Migration[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    name: 'Unify legacy custom/deleted exercise keys and initialize schema version',
    migrate: (storage) => {
      // 1. Bridge legacy custom exercises if modern key is absent
      const modernCustom = storage.getItem('maganis:workout.custom-exercises')
      const legacyCustom = storage.getItem('maganis:custom_exercises')
      if (!modernCustom && legacyCustom) {
        storage.setItem('maganis:workout.custom-exercises', legacyCustom)
      } else if (modernCustom && !legacyCustom) {
        storage.setItem('maganis:custom_exercises', modernCustom)
      }

      // 2. Bridge legacy deleted exercises if modern key is absent
      const modernDeleted = storage.getItem('maganis:workout.deleted-exercises')
      const legacyDeleted = storage.getItem('maganis:deleted_exercises')
      if (!modernDeleted && legacyDeleted) {
        storage.setItem('maganis:workout.deleted-exercises', legacyDeleted)
      } else if (modernDeleted && !legacyDeleted) {
        storage.setItem('maganis:deleted_exercises', modernDeleted)
      }

      storage.setItem(SCHEMA_VERSION_KEY, '2')
    },
  },
]

export function getCurrentSchemaVersion(): number {
  const raw = appStorage.getItem(SCHEMA_VERSION_KEY)
  if (!raw) return 1
  const num = parseInt(raw, 10)
  return Number.isFinite(num) ? num : 1
}

/**
 * Runs pending schema migrations sequentially.
 * Takes a safety snapshot before starting.
 * If any migration throws, restores the snapshot and enters read-only recovery.
 */
export async function runMigrations(): Promise<{
  success: boolean
  fromVersion: number
  toVersion: number
}> {
  const startVersion = getCurrentSchemaVersion()
  if (startVersion >= CURRENT_SCHEMA_VERSION) {
    return { success: true, fromVersion: startVersion, toVersion: startVersion }
  }

  // Take safety snapshot of current data before modifying anything
  const safetyBackup: Record<string, string> = appStorage.getAll()

  let currentV = startVersion
  try {
    for (const m of MIGRATIONS) {
      if (m.fromVersion === currentV) {
        await m.migrate(appStorage)
        currentV = m.toVersion
      }
    }
    appStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA_VERSION))
    await appStorage.flush()
    return {
      success: true,
      fromVersion: startVersion,
      toVersion: CURRENT_SCHEMA_VERSION,
    }
  } catch (err) {
    console.error(
      `Migration failed from schema v${startVersion} to v${CURRENT_SCHEMA_VERSION}:`,
      err,
    )
    // Transactional rollback
    try {
      appStorage.clear()
      for (const [k, v] of Object.entries(safetyBackup)) {
        appStorage.setItem(k, v)
      }
      await appStorage.flush()
    } catch (rollbackErr) {
      console.error(
        'Failed to restore safety snapshot during migration rollback:',
        rollbackErr,
      )
    }

    setStorageHealthReadonly(
      `فشل ترحيل بنية البيانات من الإصدار ${startVersion} إلى الإصدار ${CURRENT_SCHEMA_VERSION}. تم استعادة النسخة الاحتياطية وإيقاف التعديلات لحماية بياناتك.`,
    )
    return { success: false, fromVersion: startVersion, toVersion: currentV }
  }
}
