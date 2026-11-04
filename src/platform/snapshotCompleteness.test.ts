import { describe, it, expect, beforeEach } from 'vitest'
import { appStorage } from './storage.ts'
import {
  buildSnapshot,
  validateSnapshot,
  applySnapshot,
} from '../modules/backup/snapshot.ts'
import { setMediaItem, getMediaItem } from '../lib/indexedStorage.ts'

describe('Snapshot V2 Completeness & Integrity', () => {
  beforeEach(() => {
    appStorage.clear()
  })

  it('guarantees round-trip preservation of 100% of included user data keys', async () => {
    // 1. Populate all included static keys
    const includedEntries: Record<string, string> = {
      'maganis:profile.active': JSON.stringify({
        id: 'user-001',
        createdAt: 1730000000000,
        updatedAt: 1730000000000,
        name: 'كابتن أحمد',
        goals: ['muscle_hypertrophy'],
        primaryGoal: 'muscle_hypertrophy',
        trainingDaysPerWeek: 4,
        body: {
          sex: 'male',
          age: 28,
          heightCm: 178,
          weightKg: 82.5,
          activityLevel: 'moderate',
        },
        medical: { hasIssues: false, injuryTags: [], notes: '' },
      }),
      'maganis:workout.program': JSON.stringify({
        id: 'prog-001',
        trainingDaysPerWeek: 4,
        primaryGoal: 'muscle_hypertrophy',
        days: [
          {
            id: 'd1',
            dayIndex: 1,
            labelAr: 'صدر',
            exercises: [{ exerciseId: 'chest-1' }],
          },
        ],
      }),
      'maganis:workout.custom-exercises': JSON.stringify([
        {
          id: 'custom-1',
          nameAr: 'تمرين بنش',
          category: 'chest',
          createdAt: 1730000000000,
        },
      ]),
      'maganis:custom_exercises': JSON.stringify([
        {
          id: 'custom-1',
          nameAr: 'تمرين بنش',
          category: 'chest',
          createdAt: 1730000000000,
        },
      ]),
      'maganis:workout.deleted-exercises': JSON.stringify(['deadlift-1']),
      'maganis:deleted_exercises': JSON.stringify(['deadlift-1']),
      'maganis:workout.saved-programs': JSON.stringify([
        {
          id: 'saved-1',
          title: 'برنامج تجريبي',
          savedAt: 1730000000000,
          program: {
            id: 'p1',
            trainingDaysPerWeek: 3,
            days: [
              {
                id: 'p1-d1',
                dayIndex: 1,
                labelAr: 'يوم صدر',
                exercises: [{ exerciseId: 'chest-1' }],
              },
            ],
          },
        },
      ]),
      'maganis:tracking.sessions': JSON.stringify([
        {
          id: 'sess-1',
          date: '2026-11-01',
          exercises: [
            { exerciseId: 'chest-1', sets: [{ reps: 10, weightKg: 80 }] },
          ],
          notes: 'تمرين قوي',
          createdAt: 1730000000000,
        },
      ]),
      'maganis:tracking.body-log': JSON.stringify([
        { date: '2026-11-01', weightKg: 82.5 },
      ]),
      'maganis:tracking.notes': JSON.stringify([
        { date: '2026-11-01', note: 'ملاحظات يومية' },
      ]),
      'maganis:exercise_overrides': JSON.stringify({
        'chest-1': { notes: 'نزول 3 ثواني' },
      }),
      'maganis:custom_meals': JSON.stringify([
        {
          id: 'meal-1',
          nameAr: 'شوفان بالتمر والبروتين',
          category: 'breakfast',
          calories: 450,
          proteinGrams: 35,
          carbsGrams: 55,
          fatsGrams: 10,
          createdAt: '2026-11-01T08:00:00.000Z',
        },
      ]),
      'maganis:custom_food_items': JSON.stringify([
        {
          id: 'food-1',
          nameAr: 'جبنة قريش',
          per100g: { calories: 98, protein: 18, carbs: 3, fats: 1 },
        },
      ]),
      'maganis:daily_nutrition_2026-11-01': JSON.stringify({
        date: '2026-11-01',
        consumedCalories: 2500,
        consumedProtein: 170,
        consumedCarbs: 300,
        consumedFats: 65,
        loggedMeals: [],
      }),
      'maganis:theme_mode': '"dark"',
      'maganis:theme': '"dark"',
      'maganis:schema_version': '2',
    }

    for (const [k, v] of Object.entries(includedEntries)) {
      appStorage.setItem(k, v)
    }

    // Also populate a media item
    await setMediaItem('thumb-custom-1', {
      dataUrl: 'data:image/png;base64,synthetic-data',
    })

    // 2. Build snapshot
    const snapshot = await buildSnapshot()

    expect(snapshot.schemaVersion).toBe(2)
    expect(snapshot.format).toBe('maganis-snapshot')
    expect(Object.keys(snapshot.manifest.kv).length).toBeGreaterThanOrEqual(
      Object.keys(includedEntries).length,
    )
    expect(snapshot.manifest.counts.customMeals).toBe(1)
    expect(snapshot.manifest.counts.customFoods).toBe(1)
    expect(snapshot.manifest.counts.customExercises).toBe(1)

    // 3. Verify every include key is in the snapshot data.kv
    for (const key of Object.keys(includedEntries)) {
      expect(snapshot.data.kv[key]).toBeDefined()
      expect(snapshot.data.kv[key]).toBe(includedEntries[key])
    }

    // 4. Validate snapshot through validator
    const validation = await validateSnapshot(snapshot)
    expect(validation.ok).toBe(true)

    // 5. Clear storage and restore from snapshot
    appStorage.clear()
    expect(appStorage.getItem('maganis:profile.active')).toBeNull()

    const applyResult = await applySnapshot(snapshot)
    expect(applyResult.success).toBe(true)
    expect(applyResult.appliedCounts.customMeals).toBe(1)
    expect(applyResult.appliedCounts.customFoods).toBe(1)

    // 6. Verify round-trip equality
    for (const [key, val] of Object.entries(includedEntries)) {
      const restored = appStorage.getItem(key)
      expect(restored).toBe(val)
    }

    // 7. Verify media round-trip
    const restoredMedia = await getMediaItem<{ dataUrl?: string }>(
      'thumb-custom-1',
    )
    expect(restoredMedia).not.toBeNull()
    if (restoredMedia && typeof restoredMedia === 'object') {
      expect(restoredMedia.dataUrl).toBe('data:image/png;base64,synthetic-data')
    }
  })

  it('rejects tampered or corrupt snapshot payloads before making any changes', async () => {
    appStorage.setItem(
      'maganis:profile.active',
      JSON.stringify({ id: 'original-user' }),
    )

    const snapshot = await buildSnapshot()
    // Tamper with payload without updating manifest checksum
    snapshot.data.kv['maganis:profile.active'] = JSON.stringify({
      id: 'hacked-user',
    })

    const validation = await validateSnapshot(snapshot)
    expect(validation.ok).toBe(false)
    expect(validation.errorAr).toContain(
      'تطابق البصمة الرقمية (SHA-256) غير صحيح',
    )

    const applyResult = await applySnapshot(snapshot)
    expect(applyResult.success).toBe(false)

    // Existing data is untouched
    const current = appStorage.getItem('maganis:profile.active')
    expect(JSON.parse(current || '{}').id).toBe('original-user')
  })
})
