import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  requestStoragePersistenceOnce,
  isStoragePersisted,
  STORAGE_PERSIST_KEY,
} from './storagePersist'

describe('storagePersist', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('calls navigator.storage.persist if not previously requested', async () => {
    const mockPersist = vi.fn().mockResolvedValue(true)
    const mockPersisted = vi.fn().mockResolvedValue(true)
    Object.defineProperty(navigator, 'storage', {
      value: {
        persist: mockPersist,
        persisted: mockPersisted,
      },
      configurable: true,
      writable: true,
    })

    const res = await requestStoragePersistenceOnce()
    expect(res).toBe(true)
    expect(mockPersist).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(STORAGE_PERSIST_KEY)).toBe('true')

    // Second call should not call persist again
    await requestStoragePersistenceOnce()
    expect(mockPersist).toHaveBeenCalledTimes(1)
    expect(mockPersisted).toHaveBeenCalledTimes(1)
  })

  it('handles missing navigator.storage gracefully', async () => {
    Object.defineProperty(navigator, 'storage', {
      value: undefined,
      configurable: true,
      writable: true,
    })

    const res = await requestStoragePersistenceOnce()
    expect(res).toBe(false)
    const status = await isStoragePersisted()
    expect(status).toBe(false)
  })
})
