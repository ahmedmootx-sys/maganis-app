import { describe, it, expect, beforeEach } from 'vitest'
import { appStorage } from './storage.ts'
import {
  runMigrations,
  getCurrentSchemaVersion,
  SCHEMA_VERSION_KEY,
} from './migrations.ts'
import { storageHealth } from './storageHealth.ts'

describe('Platform Schema Migrations & Safety Rollback', () => {
  beforeEach(() => {
    appStorage.clear()
    storageHealth.resetForTest()
  })

  it('migrates from v1 to v2 and bridges legacy custom exercises', async () => {
    // Setup v1 state
    appStorage.setItem(
      'maganis:custom_exercises',
      JSON.stringify([{ id: 'c1', nameAr: 'تمرين' }]),
    )
    appStorage.setItem('maganis:deleted_exercises', JSON.stringify(['d1']))

    expect(getCurrentSchemaVersion()).toBe(1)

    const res = await runMigrations()
    expect(res.success).toBe(true)
    expect(res.toVersion).toBe(2)
    expect(getCurrentSchemaVersion()).toBe(2)

    // Verify bridged keys
    expect(appStorage.getItem('maganis:workout.custom-exercises')).toBe(
      JSON.stringify([{ id: 'c1', nameAr: 'تمرين' }]),
    )
    expect(appStorage.getItem('maganis:workout.deleted-exercises')).toBe(
      JSON.stringify(['d1']),
    )
  })

  it('no-ops if already at current version', async () => {
    appStorage.setItem(SCHEMA_VERSION_KEY, '2')
    const res = await runMigrations()
    expect(res.success).toBe(true)
    expect(res.fromVersion).toBe(2)
    expect(res.toVersion).toBe(2)
  })
})
