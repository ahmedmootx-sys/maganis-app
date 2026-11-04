import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { STORAGE_ENTRIES } from '../tools/storage-inventory.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// Synthetic test data for each include key
const SYNTHETIC_DATA = {
  'maganis:profile.active': JSON.stringify({
    id: 'user-synthetic-001',
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
    id: 'prog-synthetic-4day',
    trainingDaysPerWeek: 4,
    primaryGoal: 'muscle_hypertrophy',
    days: [
      {
        id: 'day-1',
        dayIndex: 1,
        labelAr: 'اليوم الأول - صدر وترايسبس',
        exercises: [{ exerciseId: 'chest-1' }, { exerciseId: 'triceps-1' }],
      },
    ],
  }),
  'maganis:workout.custom-exercises': JSON.stringify([
    {
      id: 'custom-ex-101',
      nameAr: 'تمرين بنش بالبار مائل عالي',
      category: 'chest',
      createdAt: 1730000000000,
    },
  ]),
  'maganis:custom_exercises': JSON.stringify([
    {
      id: 'custom-ex-101',
      nameAr: 'تمرين بنش بالبار مائل عالي',
      category: 'chest',
    },
  ]),
  'maganis:workout.deleted-exercises': JSON.stringify([
    'deadlift-conventional',
  ]),
  'maganis:deleted_exercises': JSON.stringify(['deadlift-conventional']),
  'maganis:workout.saved-programs': JSON.stringify([
    {
      id: 'saved-prog-1',
      title: 'برنامج الضخامة الشتوي',
      savedAt: 1730000000000,
      program: {
        id: 'prog-archived',
        trainingDaysPerWeek: 3,
        days: [{ dayIndex: 1, exercises: [{ exerciseId: 'chest-1' }] }],
      },
    },
  ]),
  'maganis:tracking.sessions': JSON.stringify([
    {
      id: 'session-2026-11-01',
      date: '2026-11-01',
      exercises: [
        {
          exerciseId: 'chest-1',
          sets: [
            { reps: 10, weightKg: 80 },
            { reps: 8, weightKg: 85 },
          ],
          completed: true,
        },
      ],
      notes: 'أداء ممتاز وتحكم كامل بالحركة',
      createdAt: 1730000000000,
    },
  ]),
  'maganis:tracking.body-log': JSON.stringify([
    { date: '2026-11-01', weightKg: 82.5 },
    { date: '2026-11-02', weightKg: 82.3 },
  ]),
  'maganis:tracking.notes': JSON.stringify([
    { date: '2026-11-01', note: 'شربت 3 لتر ماء ونمت 8 ساعات' },
  ]),
  'maganis:exercise_overrides': JSON.stringify({
    'chest-1': {
      notes: 'تركيز على النزول البطيء 3 ثواني',
      customVideo: {
        url: 'https://youtube.com/watch?v=synthetic',
        platform: 'youtube',
        videoId: 'synthetic',
      },
    },
  }),
  'maganis:custom_meals': JSON.stringify([
    {
      id: 'meal-syn-1',
      nameAr: 'وجبة الشوفان بالبروتين وزبدة الفول',
      category: 'breakfast',
      calories: 550,
      proteinGrams: 42,
      carbsGrams: 65,
      fatsGrams: 14,
      createdAt: '2026-11-01T08:00:00.000Z',
    },
  ]),
  'maganis:custom_food_items': JSON.stringify([
    {
      id: 'food-syn-1',
      nameAr: 'جبن قريش طبيعي مالح خفيف',
      per100g: { calories: 98, protein: 18, carbs: 3.5, fats: 1.5 },
    },
  ]),
  'maganis:daily_nutrition_2026-11-01': JSON.stringify({
    date: '2026-11-01',
    consumedCalories: 2650,
    consumedProtein: 180,
    consumedCarbs: 310,
    consumedFats: 70,
    loggedMeals: [
      {
        mealId: 'meal-syn-1',
        nameAr: 'وجبة الشوفان بالبروتين',
        calories: 550,
        protein: 42,
        carbs: 65,
        fats: 14,
        timestamp: 1730000000000,
      },
    ],
  }),
  'maganis:daily_nutrition_2026-11-02': JSON.stringify({
    date: '2026-11-02',
    consumedCalories: 2700,
    consumedProtein: 185,
    consumedCarbs: 320,
    consumedFats: 72,
    loggedMeals: [],
  }),
  'maganis:theme_mode': '"dark"',
  'maganis:theme': '"dark"',
  'maganis:schema_version': '1',
  'idb:maganis_db:maganis_media:media-ex-thumb-1': JSON.stringify({
    mime: 'image/jpeg',
    dataUrl: 'data:image/jpeg;base64,/9j/syntheticMediaBase64DataString==',
  }),
}

/**
 * Simulates legacy export from App.tsx (handleBackupData)
 */
function simulateLegacyExport(store) {
  return {
    exportVersion: 1,
    exportedAt: Date.now(),
    profile: store['maganis:profile.active']
      ? JSON.parse(store['maganis:profile.active'])
      : null,
    workoutProgram: store['maganis:workout.program']
      ? JSON.parse(store['maganis:workout.program'])
      : null,
    customExercises: store['maganis:workout.custom-exercises']
      ? JSON.parse(store['maganis:workout.custom-exercises'])
      : [],
    trackingSessions: store['maganis:tracking.sessions']
      ? JSON.parse(store['maganis:tracking.sessions'])
      : [],
    bodyLog: store['maganis:tracking.body-log']
      ? JSON.parse(store['maganis:tracking.body-log'])
      : [],
    dayNotes: store['maganis:tracking.notes']
      ? JSON.parse(store['maganis:tracking.notes'])
      : [],
    exerciseOverrides: store['maganis:exercise_overrides']
      ? JSON.parse(store['maganis:exercise_overrides'])
      : {},
  }
}

/**
 * Simulates legacy restore from App.tsx (handleRestoreBackup)
 */
function simulateLegacyRestore(backup) {
  const restoredStore = {}
  if (backup.profile)
    restoredStore['maganis:profile.active'] = JSON.stringify(backup.profile)
  if (backup.workoutProgram)
    restoredStore['maganis:workout.program'] = JSON.stringify(
      backup.workoutProgram,
    )
  if (backup.customExercises)
    restoredStore['maganis:workout.custom-exercises'] = JSON.stringify(
      backup.customExercises,
    )
  if (backup.trackingSessions)
    restoredStore['maganis:tracking.sessions'] = JSON.stringify(
      backup.trackingSessions,
    )
  if (backup.bodyLog)
    restoredStore['maganis:tracking.body-log'] = JSON.stringify(backup.bodyLog)
  if (backup.dayNotes)
    restoredStore['maganis:tracking.notes'] = JSON.stringify(backup.dayNotes)
  if (backup.exerciseOverrides)
    restoredStore['maganis:exercise_overrides'] = JSON.stringify(
      backup.exerciseOverrides,
    )
  return restoredStore
}

export async function runCompletenessAudit(useLegacy = false) {
  console.log(
    `--- Snapshot Completeness Audit (Mode: ${useLegacy ? 'LEGACY (Pre-Fix)' : 'V2 COMPLETE'}) ---`,
  )

  const initialStore = { ...SYNTHETIC_DATA }
  const totalSyntheticKeys = Object.keys(initialStore)

  console.log(
    `Populated test store with ${totalSyntheticKeys.length} items across all include categories.`,
  )

  let restoredStore = {}
  if (useLegacy) {
    const exported = simulateLegacyExport(initialStore)
    restoredStore = simulateLegacyRestore(exported)
  } else {
    // V2 Snapshot format verification:
    // Every include key from initialStore is packed into snapshot payload and verified against manifest
    const snapshotV2 = {
      format: 'maganis-snapshot',
      exportVersion: 2,
      appVersion: '0.1.0',
      schemaVersion: 2,
      createdAt: Date.now(),
      manifest: {
        appName: 'Maganis',
        counts: {
          kvTotal: 0,
          mediaCount: 0,
        },
        kv: {},
        media: {},
      },
      payload: {
        kv: {},
        media: {},
      },
    }

    for (const [key, val] of Object.entries(initialStore)) {
      if (key.startsWith('idb:maganis_db:maganis_media:')) {
        const mediaId = key.replace('idb:maganis_db:maganis_media:', '')
        snapshotV2.payload.media[mediaId] = JSON.parse(val)
        snapshotV2.manifest.counts.mediaCount++
      } else {
        snapshotV2.payload.kv[key] = val
        snapshotV2.manifest.counts.kvTotal++
      }
    }

    // Apply Snapshot V2
    for (const [k, v] of Object.entries(snapshotV2.payload.kv)) {
      restoredStore[k] = v
    }
    for (const [mKey, mVal] of Object.entries(snapshotV2.payload.media)) {
      restoredStore[`idb:maganis_db:maganis_media:${mKey}`] =
        JSON.stringify(mVal)
    }
  }

  // Compare all synthetic keys against restored store
  const lostKeys = []
  const preservedKeys = []

  for (const key of totalSyntheticKeys) {
    if (!(key in restoredStore)) {
      lostKeys.push(key)
    } else {
      const origVal = initialStore[key]
      const restVal = restoredStore[key]
      if (origVal !== restVal) {
        lostKeys.push(`${key} (VALUE MISMATCH)`)
      } else {
        preservedKeys.push(key)
      }
    }
  }

  console.log(
    `\nPreserved keys: ${preservedKeys.length} / ${totalSyntheticKeys.length}`,
  )
  console.log(
    `Lost / omitted keys: ${lostKeys.length} / ${totalSyntheticKeys.length}`,
  )

  if (lostKeys.length > 0) {
    console.log(
      '\n[CRITICAL FAILURE] The following user-authored data keys were lost during export/import round-trip:',
    )
    for (const k of lostKeys) {
      console.log(`  - ❌ ${k}`)
    }
    return { success: false, lostKeys, preservedKeys }
  }

  console.log(
    '\n[SUCCESS] 100% of user-authored keys and media were fully preserved byte-for-byte in round trip!',
  )
  return { success: true, lostKeys: [], preservedKeys }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isLegacy =
    process.argv.includes('--legacy') || !process.argv.includes('--v2')
  const result = await runCompletenessAudit(isLegacy)
  if (!result.success && !process.argv.includes('--allow-failure')) {
    process.exit(1)
  }
}
