import { describe, it, expect, beforeEach } from 'vitest'
import { createLiveFileSyncManager } from './liveFileSync.ts'

describe('liveFileSync', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with default state when API is absent or no handle', async () => {
    const manager = createLiveFileSyncManager()
    const state = await manager.init()
    expect(state).toBeDefined()
    expect(state.isEnabled).toBe(false)
    expect(state.fileName).toBeNull()
  })

  it('getState returns consistent state', () => {
    const manager = createLiveFileSyncManager()
    const state = manager.getState()
    expect(typeof state.isSupported).toBe('boolean')
    expect(state.isEnabled).toBe(false)
  })

  it('disable resets state cleanly', async () => {
    const manager = createLiveFileSyncManager()
    await manager.disable()
    const state = manager.getState()
    expect(state.isEnabled).toBe(false)
    expect(state.fileName).toBeNull()
  })
})
