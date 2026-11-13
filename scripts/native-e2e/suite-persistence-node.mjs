/**
 * scripts/native-e2e/suite-persistence-node.mjs
 * Test Suite for Task N2: DurableFileStore, Snapshot V2, Migrations & Recovery.
 * Label: node test (platform layer, mocked)
 */

import { appStorage } from '../../src/platform/storage.ts'
import { storageHealth } from '../../src/platform/storageHealth.ts'
import {
  buildSnapshot,
  validateSnapshot,
  applySnapshot,
} from '../../src/modules/backup/snapshot.ts'
import { STORAGE_REGISTRY } from '../../src/platform/storageRegistry.ts'

export async function runPersistenceSuite() {
  console.log(
    '--- RUNNING PERSISTENCE SUITE [NODE (platform layer, mocked)] ---',
  )
  const results = []

  // T1: Storage Registry Complete
  try {
    if (STORAGE_REGISTRY.length < 15) {
      throw new Error(
        `Registry too small: ${STORAGE_REGISTRY.length} < 15 keys`,
      )
    }
    results.push({ id: 'T1-storage-registry-inventory', ok: true })
  } catch (err) {
    results.push({
      id: 'T1-storage-registry-inventory',
      ok: false,
      error: err.message,
    })
  }

  // T2: Snapshot V2 Completeness & Round-Trip
  try {
    const validProfile = {
      id: 'persona-synthetic-verified',
      name: 'كريم',
      primaryGoal: 'hypertrophy',
      goals: ['hypertrophy'],
      bodyGoal: 'gain',
      trainingStyle: ['weights'],
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      experienceLevel: 'intermediate',
      equipmentAvailable: ['barbell'],
      body: {
        sex: 'male',
        age: 30,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'moderate',
        lifestyle: 2,
        pace: 'standard',
      },
      medical: {
        hasIssues: false,
        injuryTags: [],
        notes: '',
      },
      limitations: [],
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    }
    const validProgram = {
      id: 't2-prog',
      name: 'جدول تجريبي',
      days: [
        {
          dayIndex: 0,
          labelAr: 'يوم 1',
          exercises: [{ exerciseId: 'bench-press' }],
        },
      ],
    }
    appStorage.setItem('maganis:profile.active', JSON.stringify(validProfile))
    appStorage.setItem(
      'maganis:workout.program.active',
      JSON.stringify(validProgram),
    )
    const snap = await buildSnapshot()
    const valid = await validateSnapshot(snap)
    if (!valid.ok || !valid.snapshot) {
      throw new Error(`Snapshot invalid: ${valid.errorAr}`)
    }
    const applyRes = await applySnapshot(valid.snapshot)
    if (!applyRes.success) {
      throw new Error(`Apply failed: ${applyRes.errorAr}`)
    }
    results.push({ id: 'T2-snapshot-v2-roundtrip', ok: true })
  } catch (err) {
    results.push({
      id: 'T2-snapshot-v2-roundtrip',
      ok: false,
      error: err.message,
    })
  }

  // T3: Storage Health Management
  try {
    storageHealth.setOk()
    if (storageHealth.getStatus() !== 'ok') {
      throw new Error('Storage status not ok')
    }
    storageHealth.setDegraded('اختبار تدهور')
    if (storageHealth.getStatus() !== 'degraded') {
      throw new Error('Degraded state failed')
    }
    storageHealth.setOk()
    results.push({ id: 'T3-storage-health-manager', ok: true })
  } catch (err) {
    results.push({
      id: 'T3-storage-health-manager',
      ok: false,
      error: err.message,
    })
  }

  // T4: Tamper / Corruption Rejection
  try {
    appStorage.setItem(
      'maganis:profile.active',
      '{"id":"t2-prof","name":"كريم"}',
    )
    const snap = await buildSnapshot()
    if (!snap.manifest.kv['maganis:profile.active']) {
      throw new Error('Key maganis:profile.active not in manifest')
    }
    snap.manifest.kv['maganis:profile.active'].sha256 =
      'bad_hash_tampered_12345'
    const valid = await validateSnapshot(snap)
    if (valid.ok) {
      throw new Error('Validation should reject tampered hash')
    }
    results.push({ id: 'T4-tamper-corrupt-rejection', ok: true })
  } catch (err) {
    results.push({
      id: 'T4-tamper-corrupt-rejection',
      ok: false,
      error: err.message,
    })
  }

  return results
}
