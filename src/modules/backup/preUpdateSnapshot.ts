import { appStorage } from '../../platform/storage.ts'
import { getIndexedItem, setIndexedItem } from '../../lib/indexedStorage.ts'
import { buildSnapshot, type MaganisSnapshotV2 } from './snapshot.ts'
import { recordStorageError } from '../../platform/storageHealth.ts'

import type { BackupData } from '../shared/types.ts'

export const PRE_UPDATE_SNAPSHOT_KEY = 'maganis:pre_update_snapshot'
export const PRE_UPDATE_SNAPSHOT_LAST_TAKEN =
  'maganis:pre_update_snapshot_last_taken'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export interface PreUpdateSnapshotMeta {
  takenAt: number
  snapshot: MaganisSnapshotV2
  data?: BackupData
}

export async function takePreUpdateSnapshot(
  forceOrBackup?: boolean | (() => BackupData),
  forceArg?: boolean,
): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const force =
    typeof forceOrBackup === 'boolean' ? forceOrBackup : Boolean(forceArg)
  const legacyBackupFn =
    typeof forceOrBackup === 'function' ? forceOrBackup : undefined

  try {
    const lastTakenStr = appStorage.getItem(PRE_UPDATE_SNAPSHOT_LAST_TAKEN)
    const lastTaken = lastTakenStr ? Number(lastTakenStr) : 0

    if (!force && lastTaken && Date.now() - lastTaken < ONE_DAY_MS) {
      // Throttle: snapshot already taken within the last 24 hours
      return false
    }

    const currentSnapshot = await buildSnapshot()
    const snapshotMeta: PreUpdateSnapshotMeta = {
      takenAt: Date.now(),
      snapshot: currentSnapshot,
      ...(legacyBackupFn ? { data: legacyBackupFn() } : {}),
    }

    const json = JSON.stringify(snapshotMeta)
    try {
      appStorage.setItem(PRE_UPDATE_SNAPSHOT_KEY, json)
    } catch {
      // Fallback to indexedDB if quota pressure
    }

    await setIndexedItem(PRE_UPDATE_SNAPSHOT_KEY, snapshotMeta)
    appStorage.setItem(PRE_UPDATE_SNAPSHOT_LAST_TAKEN, String(Date.now()))
    await appStorage.flush()
    return true
  } catch (err) {
    recordStorageError(PRE_UPDATE_SNAPSHOT_KEY, err)
    console.error('Failed to take pre-update snapshot:', err)
    return false
  }
}

export async function getPreUpdateSnapshot(): Promise<PreUpdateSnapshotMeta | null> {
  if (typeof window === 'undefined') return null

  try {
    const raw = appStorage.getItem(PRE_UPDATE_SNAPSHOT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PreUpdateSnapshotMeta
      if (
        parsed &&
        (parsed.snapshot || (parsed as unknown as { data: unknown }).data)
      ) {
        return parsed
      }
    }
  } catch {
    // continue to indexedDB
  }

  try {
    const idbSnapshot = await getIndexedItem<PreUpdateSnapshotMeta>(
      PRE_UPDATE_SNAPSHOT_KEY,
    )
    if (
      idbSnapshot &&
      (idbSnapshot.snapshot ||
        (idbSnapshot as unknown as { data: unknown }).data)
    ) {
      return idbSnapshot
    }
  } catch {
    // ignore
  }

  return null
}
