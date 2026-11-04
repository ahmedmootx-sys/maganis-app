import { z } from 'zod'
import {
  ProfileImportSchema,
  WorkoutProgramImportSchema,
  CustomExerciseImportSchema,
  TrackingSessionImportSchema,
  BodyLogImportSchema,
  DayNotesImportSchema,
  ExerciseOverrideImportSchema,
} from '../modules/backup/backupStore.ts'

export type StorageKind = 'authored' | 'transient' | 'derived' | 'device'
export type SnapshotPolicy = 'include' | 'exclude'

export interface StorageRegistryEntry {
  key?: string
  prefix?: string
  store:
    | 'localStorage'
    | 'indexedDB'
    | 'sessionStorage'
    | 'native-kv'
    | 'native-media'
  kind: StorageKind
  snapshot: SnapshotPolicy
  reason: string
  owner: string
  schema?: z.ZodTypeAny
}

export const CustomMealSchema = z
  .object({
    id: z.string(),
    nameAr: z.string(),
    category: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    notesAr: z.string().optional(),
    ingredients: z
      .array(
        z.object({
          foodItemId: z.string(),
          grams: z.number(),
        }),
      )
      .optional(),
    totalGrams: z.number().optional(),
    calories: z.number(),
    proteinGrams: z.number(),
    carbsGrams: z.number(),
    fatsGrams: z.number(),
    isCustom: z.literal(true).optional(),
    createdAt: z.string().optional(),
  })
  .passthrough()

export const CustomFoodItemSchema = z
  .object({
    id: z.string(),
    nameAr: z.string(),
    categoryAr: z.string().optional(),
    servingUnitAr: z.string().optional(),
    defaultGrams: z.number().optional(),
    per100g: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fats: z.number(),
    }),
  })
  .passthrough()

export const DailyNutritionLogSchema = z
  .object({
    date: z.string(),
    consumedCalories: z.number(),
    consumedProtein: z.number(),
    consumedCarbs: z.number(),
    consumedFats: z.number(),
    loggedMeals: z.array(
      z
        .object({
          mealId: z.string(),
          nameAr: z.string(),
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fats: z.number(),
          timestamp: z.number(),
        })
        .passthrough(),
    ),
  })
  .passthrough()

export const SavedWorkoutProgramSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    savedAt: z.number(),
    program: WorkoutProgramImportSchema,
    notes: z.string().optional(),
  })
  .passthrough()

export const STORAGE_REGISTRY: readonly StorageRegistryEntry[] = [
  // --- Authored Data (Snapshot: include) ---
  {
    key: 'maganis:profile.active',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Primary user profile, physical stats, goals and training preferences.',
    owner: 'src/modules/onboarding/profileStore.ts',
    schema: ProfileImportSchema,
  },
  {
    key: 'maganis:workout.program',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Active customized workout program split and exercise prescription.',
    owner: 'src/modules/workout/workoutStore.ts',
    schema: WorkoutProgramImportSchema,
  },
  {
    key: 'maganis:workout.custom-exercises',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Custom exercises authored by the user.',
    owner: 'src/modules/workout/workoutStore.ts',
    schema: z.array(CustomExerciseImportSchema),
  },
  {
    key: 'maganis:custom_exercises',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Legacy duplicate key for workout.custom-exercises; preserved for data safety.',
    owner: 'src/modules/settings/resetService.ts',
    schema: z.array(CustomExerciseImportSchema),
  },
  {
    key: 'maganis:workout.deleted-exercises',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'User customizations hiding default library exercises.',
    owner: 'src/modules/workout/workoutStore.ts',
    schema: z.array(z.string()),
  },
  {
    key: 'maganis:deleted_exercises',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Legacy duplicate key for workout.deleted-exercises; preserved for data safety.',
    owner: 'src/modules/settings/resetService.ts',
    schema: z.array(z.string()),
  },
  {
    key: 'maganis:workout.saved-programs',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Saved custom workout programs archived in program vault.',
    owner: 'src/modules/workout/workoutStore.ts',
    schema: z.array(SavedWorkoutProgramSchema),
  },
  {
    key: 'maganis:tracking.sessions',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Historical completed workout sessions, weights and reps logged by user.',
    owner: 'src/modules/tracking/trackingStore.ts',
    schema: z.array(TrackingSessionImportSchema),
  },
  {
    key: 'maganis:tracking.body-log',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Bodyweight tracking history used for nutrition energy expenditure calibration.',
    owner: 'src/modules/tracking/trackingStore.ts',
    schema: z.array(BodyLogImportSchema),
  },
  {
    key: 'maganis:tracking.notes',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Daily training notes and journal entries authored by user.',
    owner: 'src/modules/tracking/trackingStore.ts',
    schema: z.array(DayNotesImportSchema),
  },
  {
    key: 'maganis:exercise_overrides',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Exercise customizations (custom media references, notes, video links).',
    owner: 'src/modules/workout/exerciseOverrides.ts',
    schema: ExerciseOverrideImportSchema,
  },
  {
    key: 'maganis:custom_meals',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Custom meals authored by user in nutrition module.',
    owner: 'src/modules/nutrition/NutritionModule.tsx',
    schema: z.array(CustomMealSchema),
  },
  {
    key: 'maganis:custom_food_items',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Custom food items authored by user in food database.',
    owner: 'src/modules/nutrition/foodDatabase.ts',
    schema: z.array(CustomFoodItemSchema),
  },
  {
    prefix: 'maganis:daily_nutrition_',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'Daily nutrition meal logs and consumed macro trackers for each date.',
    owner: 'src/modules/nutrition/NutritionModule.tsx',
    schema: DailyNutritionLogSchema,
  },
  {
    key: 'maganis:theme_mode',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'User interface theme mode preference.',
    owner: 'src/modules/settings/SettingsScreen.tsx',
    schema: z.enum(['light', 'dark', 'system']),
  },
  {
    key: 'maganis:theme',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Resolved theme token saved across sessions.',
    owner: 'src/App.tsx',
    schema: z.enum(['light', 'dark']),
  },
  {
    key: 'maganis:schema_version',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Data schema version tracking for deterministic data migrations.',
    owner: 'src/platform/migrations.ts',
    schema: z.number().int().nonnegative(),
  },
  {
    key: 'idb:maganis_db:maganis_media',
    store: 'indexedDB',
    kind: 'authored',
    snapshot: 'include',
    reason: 'User-uploaded photos, GIFs, and videos for custom exercises.',
    owner: 'src/lib/indexedStorage.ts',
    schema: z.object({
      mime: z.string(),
      dataUrl: z.string(),
    }),
  },
  {
    key: 'maganis:notify.settings',
    store: 'localStorage',
    kind: 'authored',
    snapshot: 'include',
    reason:
      'User notification preferences, reminder schedules, keep-awake, and haptics preferences.',
    owner: 'src/platform/notifications/notificationStore.ts',
    schema: z.object({
      masterEnabled: z.boolean(),
      workoutReminderEnabled: z.boolean(),
      workoutReminderTime: z.string(),
      nutritionReminderEnabled: z.boolean(),
      nutritionReminderTime: z.string(),
      restEndEnabled: z.boolean(),
      cardioEndEnabled: z.boolean(),
      backupAlertEnabled: z.boolean(),
      keepScreenOnEnabled: z.boolean(),
      hapticsEnabled: z.boolean(),
    }),
  },

  // --- Transient Data (Snapshot: exclude) ---
  {
    key: 'maganis:active_session',
    store: 'localStorage',
    kind: 'transient',
    snapshot: 'exclude',
    reason:
      'Active workout in progress is ephemeral device state; restoring from backup would corrupt live tracking.',
    owner: 'src/modules/workout/ActiveWorkoutSession.tsx',
  },
  {
    key: 'maganis:cardio_active_session',
    store: 'localStorage',
    kind: 'transient',
    snapshot: 'exclude',
    reason:
      'Active cardio runner session in progress is ephemeral device state.',
    owner: 'src/modules/workout/CardioRunner.tsx',
  },
  {
    key: 'maganis:onboarding_draft',
    store: 'localStorage',
    kind: 'transient',
    snapshot: 'exclude',
    reason:
      'Unfinished onboarding wizard state; discarded upon completing onboarding.',
    owner: 'src/modules/onboarding/OnboardingWizard.tsx',
  },
  {
    key: 'maganis:profile.draft',
    store: 'localStorage',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Unfinished onboarding wizard state.',
    owner: 'src/modules/onboarding/profileStore.ts',
  },
  {
    key: 'maganis:backup_reminder_dismissed',
    store: 'localStorage',
    kind: 'transient',
    snapshot: 'exclude',
    reason:
      'Temporary UI reminder dismiss timestamp; should not persist across devices or overwrite user reminders.',
    owner: 'src/modules/dashboard/Dashboard.tsx',
  },
  {
    key: 'maganis:redflag_dismissed',
    store: 'localStorage',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Temporary UI banner dismissal flag.',
    owner: 'src/modules/dashboard/Dashboard.tsx',
  },

  // --- Derived Data (Snapshot: exclude) ---
  {
    key: 'maganis:pre_update_snapshot',
    store: 'localStorage',
    kind: 'derived',
    snapshot: 'exclude',
    reason:
      'Safety rollback snapshot taken automatically before import/restore; derived from current state.',
    owner: 'src/modules/backup/preUpdateSnapshot.ts',
  },
  {
    key: 'maganis:g4_snapshot_taken',
    store: 'localStorage',
    kind: 'derived',
    snapshot: 'exclude',
    reason: 'Internal migration one-time flag.',
    owner: 'src/modules/backup/preUpdateSnapshot.ts',
  },

  // --- Device-Specific Data (Snapshot: exclude) ---
  {
    key: 'maganis:storage_persist_requested',
    store: 'localStorage',
    kind: 'device',
    snapshot: 'exclude',
    reason:
      'Browser-specific flag indicating navigator.storage.persist() was requested on this device.',
    owner: 'src/lib/storagePersist.ts',
  },
  {
    key: 'backup.last-export',
    store: 'localStorage',
    kind: 'device',
    snapshot: 'exclude',
    reason:
      'Timestamp of last backup export performed on this specific device.',
    owner: 'src/modules/backup/backupStore.ts',
  },
  {
    key: 'maganis:backup.status',
    store: 'localStorage',
    kind: 'device',
    snapshot: 'exclude',
    reason:
      'Device-specific backup execution and read-back verification status record.',
    owner: 'src/modules/backup/backupEngine.ts',
  },
  {
    key: 'maganis:backup.settings',
    store: 'localStorage',
    kind: 'device',
    snapshot: 'exclude',
    reason:
      'Device-specific automatic backup configuration and destination choices.',
    owner: 'src/modules/backup/backupEngine.ts',
  },
  {
    key: 'maganis:backup.snooze',
    store: 'localStorage',
    kind: 'device',
    snapshot: 'exclude',
    reason: 'Device-specific snooze timestamp for failing backup reminders.',
    owner: 'src/modules/backup/backupEngine.ts',
  },
  {
    key: 'maganis:notify.lastSync',
    store: 'localStorage',
    kind: 'device',
    snapshot: 'exclude',
    reason:
      'Device-specific notification schedule synchronization diagnostics and permission states.',
    owner: 'src/platform/notifications/notificationEngine.ts',
  },
  {
    key: 'idb:maganis_file_sync',
    store: 'indexedDB',
    kind: 'device',
    snapshot: 'exclude',
    reason:
      'Web-only device directory handle; cannot be transferred across devices or to Android.',
    owner: 'src/lib/liveFileSync.ts',
  },
]

/**
 * Finds the registry entry for a specific key (exact match or prefix match).
 */
export function findRegistryEntry(
  key: string,
): StorageRegistryEntry | undefined {
  if (typeof key !== 'string') return undefined
  for (const entry of STORAGE_REGISTRY) {
    if (entry.key && entry.key === key) {
      return entry
    }
    if (entry.prefix && key.startsWith(entry.prefix)) {
      return entry
    }
  }
  return undefined
}

/**
 * Checks whether a given key should be included in a complete snapshot.
 * Unrecognized keys default to false and should trigger an alert.
 */
export function shouldIncludeInSnapshot(key: string): boolean {
  const entry = findRegistryEntry(key)
  return entry?.snapshot === 'include'
}

/**
 * Returns all keys from a list of storage keys that belong in the snapshot.
 */
export function getSnapshotIncludeKeys(allKeys: string[]): string[] {
  return allKeys.filter(shouldIncludeInSnapshot)
}
