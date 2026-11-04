/**
 * Live File Sync using the File System Access API & IndexedDB handle persistence.
 * Allows users to choose a file on their device, and the app automatically updates it
 * whenever changes occur, eliminating the need for repetitive manual exports.
 */
import type { BackupData } from '../modules/shared/types.ts'
import { isNative } from '../platform/runtime.ts'
import {
  getIndexedItem,
  setIndexedItem,
  removeIndexedItem,
} from './indexedStorage.ts'

const HANDLE_KEY = 'live_file_handle'

async function saveHandle(handle: FileSystemFileHandle): Promise<void> {
  await setIndexedItem(HANDLE_KEY, handle)
}

async function loadSavedHandle(): Promise<FileSystemFileHandle | null> {
  try {
    return await getIndexedItem<FileSystemFileHandle>(HANDLE_KEY)
  } catch {
    return null
  }
}

async function deleteSavedHandle(): Promise<void> {
  try {
    await removeIndexedItem(HANDLE_KEY)
  } catch {
    // silent
  }
}

export interface LiveFileSyncState {
  isSupported: boolean
  isEnabled: boolean
  fileName: string | null
  lastSyncedAt: number | null
}

export interface LiveFileSyncManager {
  isSupported(): boolean
  init(): Promise<LiveFileSyncState>
  enable(
    initialData: BackupData,
  ): Promise<{ ok: boolean; fileName?: string; error?: string }>
  disable(): Promise<void>
  sync(data: BackupData): Promise<boolean>
  getState(): LiveFileSyncState
}

export function createLiveFileSyncManager(): LiveFileSyncManager {
  let cachedHandle: FileSystemFileHandle | null = null
  let state: LiveFileSyncState = {
    isSupported:
      typeof window !== 'undefined' && 'showSaveFilePicker' in window,
    isEnabled: false,
    fileName: null,
    lastSyncedAt: null,
  }

  function isSupported(): boolean {
    if (isNative()) return false
    return typeof window !== 'undefined' && 'showSaveFilePicker' in window
  }

  async function init(): Promise<LiveFileSyncState> {
    if (!isSupported()) {
      state.isSupported = false
      return state
    }

    try {
      const handle = await loadSavedHandle()
      if (handle) {
        cachedHandle = handle
        state = {
          isSupported: true,
          isEnabled: true,
          fileName: handle.name,
          lastSyncedAt: Date.now(),
        }
      } else {
        state = {
          isSupported: true,
          isEnabled: false,
          fileName: null,
          lastSyncedAt: null,
        }
      }
    } catch {
      state.isEnabled = false
    }

    return state
  }

  async function enable(
    initialData: BackupData,
  ): Promise<{ ok: boolean; fileName?: string; error?: string }> {
    if (!isSupported()) {
      return {
        ok: false,
        error: 'المتصفح لا يدعم الوصول المباشر لملفات النظام',
      }
    }

    try {
      const handle = await (
        window as unknown as {
          showSaveFilePicker(opts: unknown): Promise<FileSystemFileHandle>
        }
      ).showSaveFilePicker({
        suggestedName: 'maganis-data.json',
        types: [
          {
            description: 'ملف بيانات Maganis JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      })

      cachedHandle = handle
      await saveHandle(handle)
      await writeToHandle(handle, initialData)

      state = {
        isSupported: true,
        isEnabled: true,
        fileName: handle.name,
        lastSyncedAt: Date.now(),
      }

      return { ok: true, fileName: handle.name }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        return { ok: false, error: 'تم إلغاء تحديد الملف' }
      }
      return { ok: false, error: 'تعذر تفعيل المزامنة مع الملف' }
    }
  }

  async function disable(): Promise<void> {
    cachedHandle = null
    await deleteSavedHandle()
    state = {
      isSupported: isSupported(),
      isEnabled: false,
      fileName: null,
      lastSyncedAt: null,
    }
  }

  async function writeToHandle(
    handle: FileSystemFileHandle,
    data: BackupData,
  ): Promise<boolean> {
    try {
      // Check queryPermission if available
      if ('queryPermission' in handle) {
        const perm = await (
          handle as unknown as {
            queryPermission(opts: { mode: string }): Promise<string>
          }
        ).queryPermission({ mode: 'readwrite' })
        if (perm !== 'granted') {
          const reqPerm = await (
            handle as unknown as {
              requestPermission(opts: { mode: string }): Promise<string>
            }
          ).requestPermission({ mode: 'readwrite' })
          if (reqPerm !== 'granted') return false
        }
      }

      const writable = await handle.createWritable()
      const json = JSON.stringify(data, null, 2)
      await writable.write(json)
      await writable.close()
      state.lastSyncedAt = Date.now()
      return true
    } catch {
      return false
    }
  }

  async function sync(data: BackupData): Promise<boolean> {
    if (!state.isEnabled || !cachedHandle) return false
    return writeToHandle(cachedHandle, data)
  }

  function getState(): LiveFileSyncState {
    return state
  }

  return { isSupported, init, enable, disable, sync, getState }
}
