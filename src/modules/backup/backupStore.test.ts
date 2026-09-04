import { describe, it, expect, beforeEach } from 'vitest'
import { createBackupStore } from './backupStore.ts'

describe('backupStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shouldShowReminder returns true when never exported', () => {
    const store = createBackupStore()
    expect(store.shouldShowReminder()).toBe(true)
  })

  it('shouldShowReminder returns false after fresh export', () => {
    const store = createBackupStore()
    store.recordExport()
    expect(store.shouldShowReminder()).toBe(false)
  })

  it('shouldShowReminder returns true when last export is older than 7 days', () => {
    const store = createBackupStore()
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    localStorage.setItem('backup.last-export', JSON.stringify(eightDaysAgo))
    expect(store.shouldShowReminder()).toBe(true)
  })

  it('importData rejects non-json files', async () => {
    const store = createBackupStore()
    const file = new File(['not valid json {{{{'], 'backup.json', {
      type: 'application/json',
    })
    const res = await store.importData(file)
    expect(res.ok).toBe(false)
    expect(res.error).toBeDefined()
  })

  it('importData rejects files without exportVersion', async () => {
    const store = createBackupStore()
    const file = new File([JSON.stringify({ someKey: 123 })], 'backup.json', {
      type: 'application/json',
    })
    const res = await store.importData(file)
    expect(res.ok).toBe(false)
    expect(res.error).toContain('رقم إصدار')
  })

  it('importData accepts valid backup structure', async () => {
    const store = createBackupStore()
    const valid = {
      exportVersion: 1,
      exportedAt: Date.now(),
      profile: { id: 'p1', name: 'Test' },
      trackingSessions: [],
      bodyLog: [],
      dayNotes: [],
    }
    const file = new File([JSON.stringify(valid)], 'backup.json', {
      type: 'application/json',
    })
    const res = await store.importData(file)
    expect(res.ok).toBe(true)
    expect(res.data?.exportVersion).toBe(1)
    expect((res.data?.profile as Record<string, unknown>)?.id).toBe('p1')
  })
})
