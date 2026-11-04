import { isNative } from './runtime.ts'
import { appStorage } from './storage.ts'
import { MaganisNative } from './native/maganisNative.ts'
import {
  storageHealth,
  setStorageHealthReadonly,
  setStorageHealthDegraded,
} from './storageHealth.ts'
import { runMigrations } from './migrations.ts'

export interface BootstrapResult {
  ok: boolean
  hydrationTimeMs: number
  keyCount: number
  recoveryEventsCount: number
  error?: string
}

export async function bootstrapPlatform(): Promise<BootstrapResult> {
  const startTime = Date.now()

  try {
    if (isNative()) {
      // 1. Native KV Hydration
      const readResult = await MaganisNative.kvReadAll()
      appStorage.hydrate(readResult.data || {})

      // 2. Process any recovery events detected by the native file store
      if (readResult.recoveryEvents && readResult.recoveryEvents.length > 0) {
        for (const ev of readResult.recoveryEvents) {
          if (ev.recoveredFrom === 'corrupt') {
            storageHealth.setCorrupt(ev.key, ev.reason)
          } else {
            setStorageHealthDegraded(
              `تم استرداد المفتاح ${ev.key} من النسخة الاحتياطية (${ev.reason})`,
            )
          }
        }
      }

      // 3. Query disk space stats
      try {
        const stats = await MaganisNative.kvStats()
        storageHealth.updateDiskStats(
          stats.freeSpaceBytes,
          stats.totalBytes,
          stats.keyCount,
        )
      } catch (err) {
        console.warn('Failed to query native kvStats:', err)
      }
    }

    // 4. Schema Migrations (runs on both web and native)
    const migrationResult = await runMigrations()
    if (!migrationResult.success) {
      return {
        ok: false,
        hydrationTimeMs: Date.now() - startTime,
        keyCount: appStorage.length,
        recoveryEventsCount: 0,
        error: 'فشل تشغيل ترحيل بنية البيانات',
      }
    }

    const duration = Date.now() - startTime
    return {
      ok: true,
      hydrationTimeMs: duration,
      keyCount: appStorage.length,
      recoveryEventsCount: 0,
    }
  } catch (err) {
    const duration = Date.now() - startTime
    const errMsg = String(err)
    console.error('Fatal error during bootstrapPlatform:', err)
    setStorageHealthReadonly(
      'مش قادر أقرأ بياناتك. بياناتك لسه موجودة ومتمسحتش.',
    )
    return {
      ok: false,
      hydrationTimeMs: duration,
      keyCount: 0,
      recoveryEventsCount: 0,
      error: errMsg,
    }
  }
}
