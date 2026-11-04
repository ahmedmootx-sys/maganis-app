import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  saveExerciseOverride,
  getExerciseOverride,
  StorageSaveError,
} from './exerciseOverrides.ts'
import * as indexedStorage from '../../lib/indexedStorage.ts'
import { appStorage } from '../../platform/storage.ts'

describe('Exercise Overrides Storage Failure & Rollback', () => {
  beforeEach(() => {
    appStorage.clear()
    vi.restoreAllMocks()
  })

  it('throws StorageSaveError and preserves prior state if setIndexedItem fails', async () => {
    vi.spyOn(indexedStorage, 'setIndexedItem').mockResolvedValue(false)
    vi.spyOn(indexedStorage, 'removeMediaItem').mockResolvedValue(true)

    const initialOverride = getExerciseOverride('chest-press')
    expect(initialOverride).toBeUndefined()

    await expect(
      saveExerciseOverride({
        exerciseId: 'chest-press',
        personalNote: 'تكرار بطيء',
      }),
    ).rejects.toThrow(StorageSaveError)

    // Verify in-memory state was NOT updated
    expect(getExerciseOverride('chest-press')).toBeUndefined()
  })

  it('throws StorageSaveError and rolls back if media write fails', async () => {
    vi.spyOn(indexedStorage, 'setMediaItem').mockResolvedValue(false)

    await expect(
      saveExerciseOverride(
        {
          exerciseId: 'bench-press',
          personalNote: 'تكرار',
          media: {
            kind: 'upload-image',
            blobKey: 'bench-press',
            updatedAt: Date.now(),
          },
        },
        { dataUrl: 'data:image/png;base64,synthetic' },
      ),
    ).rejects.toThrow(StorageSaveError)

    expect(getExerciseOverride('bench-press')).toBeUndefined()
  })
})
