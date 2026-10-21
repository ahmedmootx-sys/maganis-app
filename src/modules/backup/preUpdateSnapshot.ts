import type { BackupData } from '../shared/types.ts'
import { getIndexedItem, setIndexedItem } from '../../lib/indexedStorage.ts'

export const PRE_UPDATE_SNAPSHOT_KEY = 'maganis:pre_update_snapshot'
export const PRE_UPDATE_SNAPSHOT_FLAG = 'maganis:g4_snapshot_taken'

export interface PreUpdateSnapshotMeta {
  takenAt: number
  data: BackupData
}

export async function takePreUpdateSnapshot(
  getData: () => BackupData,
): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    const flag = localStorage.getItem(PRE_UPDATE_SNAPSHOT_FLAG)
    if (flag) {
      return false
    }

    const currentData = getData()
    const snapshotMeta: PreUpdateSnapshotMeta = {
      takenAt: Date.now(),
      data: currentData,
    }

    const json = JSON.stringify(snapshotMeta)
    try {
      localStorage.setItem(PRE_UPDATE_SNAPSHOT_KEY, json)
    } catch {
      // localStorage quota exceeded, fallback to indexedDB only
    }

    await setIndexedItem(PRE_UPDATE_SNAPSHOT_KEY, snapshotMeta)
    localStorage.setItem(PRE_UPDATE_SNAPSHOT_FLAG, 'true')
    return true
  } catch (err) {
    console.error('Failed to take pre-update snapshot', err)
    return false
  }
}

export async function getPreUpdateSnapshot(): Promise<PreUpdateSnapshotMeta | null> {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(PRE_UPDATE_SNAPSHOT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PreUpdateSnapshotMeta
      if (parsed && parsed.data) return parsed
    }
  } catch {
    // continue to indexedDB
  }

  try {
    const idbSnapshot = await getIndexedItem<PreUpdateSnapshotMeta>(
      PRE_UPDATE_SNAPSHOT_KEY,
    )
    if (idbSnapshot && idbSnapshot.data) {
      return idbSnapshot
    }
  } catch {
    // ignore
  }

  return null
}
