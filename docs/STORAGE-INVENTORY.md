# Maganis Storage Inventory & Snapshot Classification

Generated: 2026-11-04T04:48:02.879Z

This document is the authoritative inventory of all storage call sites, keys, databases, and session storage uses in Maganis.
It defines which keys are included in the complete v2 snapshot and provides the exact architectural justification for exclusions.

## 1. Snapshot INCLUDED Keys (Authored User Data)

Every key in this table is user-authored and guaranteed to be preserved across backups, migrations, and PWA-to-native transfer.

| Key / Prefix                        | Store                                                    | Owner Module                                | Value Shape                                                                                   | Kind       | Reason                                                                                  |
| :---------------------------------- | :------------------------------------------------------- | :------------------------------------------ | :-------------------------------------------------------------------------------------------- | :--------- | :-------------------------------------------------------------------------------------- |
| `maganis:profile.active`            | localStorage                                             | `src/modules/onboarding/profileStore.ts`    | UserProfile (id, name, goals, primaryGoal, trainingDaysPerWeek, medical, body)                | `authored` | Primary user profile, physical stats, goals and training preferences.                   |
| `maganis:workout.program`           | localStorage                                             | `src/modules/workout/workoutStore.ts`       | WorkoutProgram (id, days[], trainingDaysPerWeek, primaryGoal)                                 | `authored` | Active customized workout program split and exercise prescription.                      |
| `maganis:workout.custom-exercises`  | localStorage                                             | `src/modules/workout/workoutStore.ts`       | CustomExercise[] (id, nameAr, category, targetSubMuscle, ...)                                 | `authored` | Custom exercises authored by the user.                                                  |
| `maganis:custom_exercises`          | localStorage                                             | `src/modules/settings/resetService.ts`      | CustomExercise[] (legacy duplicate key for workout.custom-exercises)                          | `authored` | Legacy key used in resetService; preserved for backwards compatibility and data safety. |
| `maganis:workout.deleted-exercises` | localStorage                                             | `src/modules/workout/workoutStore.ts`       | string[] (canonical exercise IDs hidden/deleted by user)                                      | `authored` | User customizations hiding default library exercises.                                   |
| `maganis:deleted_exercises`         | localStorage                                             | `src/modules/settings/resetService.ts`      | string[] (legacy duplicate key for workout.deleted-exercises)                                 | `authored` | Legacy key used in resetService; preserved for data safety.                             |
| `maganis:workout.saved-programs`    | localStorage                                             | `src/modules/workout/workoutStore.ts`       | SavedWorkoutProgram[] (id, title, program, savedAt)                                           | `authored` | Saved custom workout programs archived in program vault.                                |
| `maganis:tracking.sessions`         | localStorage                                             | `src/modules/tracking/trackingStore.ts`     | TrackingSession[] (id, date, exercises[], notes, createdAt)                                   | `authored` | Historical completed workout sessions, weights and reps logged by user.                 |
| `maganis:tracking.body-log`         | localStorage                                             | `src/modules/tracking/trackingStore.ts`     | BodyLogEntry[] (date, weightKg)                                                               | `authored` | Bodyweight tracking history used for nutrition energy expenditure calibration.          |
| `maganis:tracking.notes`            | localStorage                                             | `src/modules/tracking/trackingStore.ts`     | DayNote[] (date, note)                                                                        | `authored` | Daily training notes and journal entries authored by user.                              |
| `maganis:exercise_overrides`        | localStorage                                             | `src/modules/workout/exerciseOverrides.ts`  | Record<string, ExerciseOverride> (customImage, customVideo, notes)                            | `authored` | Exercise customizations (custom media references, notes, video links).                  |
| `maganis:custom_meals`              | localStorage                                             | `src/modules/nutrition/NutritionModule.tsx` | CustomMeal[] (id, nameAr, category, items[], totalKcal, totalProtein)                         | `authored` | Custom meals authored by user in nutrition module.                                      |
| `maganis:custom_food_items`         | localStorage                                             | `src/modules/nutrition/foodDatabase.ts`     | CustomFoodItem[] (id, nameAr, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, ...) | `authored` | Custom food items authored by user in food database.                                    |
| `maganis:daily_nutrition_*`         | localStorage                                             | `src/modules/nutrition/NutritionModule.tsx` | DailyNutritionLog (date, targetCalories, targetProteinG, entries[], ...)                      | `authored` | Daily nutrition meal logs and consumed macro trackers for each date.                    |
| `maganis:theme_mode`                | localStorage                                             | `src/modules/settings/SettingsScreen.tsx`   | "light"                                                                                       | "dark"     | "system"                                                                                | `authored`                                  | User interface theme mode preference. |
| `maganis:theme`                     | localStorage                                             | `src/App.tsx`                               | "light"                                                                                       | "dark"     | `authored`                                                                              | Resolved theme token saved across sessions. |
| `maganis:schema_version`            | localStorage / native kv                                 | `src/platform/migrations.ts`                | number (integer version, e.g. 1 or 2)                                                         | `authored` | Data schema version tracking for deterministic data migrations.                         |
| `idb:maganis_db:maganis_media*`     | IndexedDB (store: maganis_media) / native platform.media | `src/lib/indexedStorage.ts`                 | MediaItem: { mime: string, dataUrl: string } (blobs and data URLs for custom exercise media)  | `authored` | User-uploaded photos, GIFs, and videos for custom exercises.                            |

## 2. Snapshot EXCLUDED Keys (Transient, Derived, and Device-Specific)

| Key / Prefix                        | Store                                 | Owner Module                                   | Kind        | Snapshot  | Reason for Exclusion                                                                                                                                           |
| :---------------------------------- | :------------------------------------ | :--------------------------------------------- | :---------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maganis:active_session`            | localStorage                          | `src/modules/workout/ActiveWorkoutSession.tsx` | `transient` | `exclude` | Active workout in progress is ephemeral device state; importing into another device or restoring from backup would corrupt live tracking.                      |
| `maganis:cardio_active_session`     | localStorage                          | `src/modules/workout/CardioRunner.tsx`         | `transient` | `exclude` | Active cardio runner session in progress is ephemeral device state.                                                                                            |
| `maganis:onboarding_draft`          | localStorage                          | `src/modules/onboarding/OnboardingWizard.tsx`  | `transient` | `exclude` | Unfinished onboarding wizard state; discarded upon completing onboarding.                                                                                      |
| `maganis:profile.draft`             | localStorage                          | `src/modules/onboarding/profileStore.ts`       | `transient` | `exclude` | Unfinished onboarding wizard state.                                                                                                                            |
| `maganis:backup_reminder_dismissed` | localStorage                          | `src/modules/dashboard/Dashboard.tsx`          | `transient` | `exclude` | Temporary UI reminder dismiss timestamp; should not persist across devices or overwrite user reminders.                                                        |
| `maganis:redflag_dismissed`         | localStorage                          | `src/modules/dashboard/Dashboard.tsx`          | `transient` | `exclude` | Temporary UI banner dismissal flag.                                                                                                                            |
| `maganis:pre_update_snapshot`       | localStorage + IndexedDB (maganis_kv) | `src/modules/backup/preUpdateSnapshot.ts`      | `derived`   | `exclude` | Safety rollback snapshot taken automatically before import/restore; derived from current state; packing snapshots inside snapshots causes recursion and bloat. |
| `maganis:g4_snapshot_taken`         | localStorage                          | `src/modules/backup/preUpdateSnapshot.ts`      | `derived`   | `exclude` | Internal migration one-time flag.                                                                                                                              |
| `maganis:storage_persist_requested` | localStorage                          | `src/lib/storagePersist.ts`                    | `device`    | `exclude` | Browser-specific flag indicating navigator.storage.persist() was requested on this device.                                                                     |
| `backup.last-export`                | localStorage                          | `src/modules/backup/backupStore.ts`            | `device`    | `exclude` | Timestamp of last backup export performed on this specific device.                                                                                             |
| `maganis:backup.status`             | localStorage                          | `src/modules/backup/backupEngine.ts`           | `device`    | `exclude` | Device-specific backup execution and read-back verification status record.                                                                                     |
| `maganis:backup.settings`           | localStorage                          | `src/modules/backup/backupEngine.ts`           | `device`    | `exclude` | Device-specific automatic backup configuration and destination choices.                                                                                        |
| `maganis:backup.snooze`             | localStorage                          | `src/modules/backup/backupEngine.ts`           | `device`    | `exclude` | Device-specific snooze timestamp for failing backup reminders.                                                                                                 |
| `idb:maganis_file_sync`             | IndexedDB (db: maganis_file_sync)     | `src/lib/liveFileSync.ts`                      | `device`    | `exclude` | Web-only device directory handle; cannot be transferred across devices or to Android.                                                                          |
| `sessionStorage (all)*`             | sessionStorage                        | `src/modules/settings/resetService.ts`         | `transient` | `exclude` | Ephemeral browser session memory; cleared on factory reset.                                                                                                    |

## 3. Discovered Duplicates, Inconsistencies & Legacy Keys

During the inventory audit, the following key discrepancies were identified in the codebase:

1. **`maganis:custom_exercises` vs `maganis:workout.custom-exercises`**:
   - `src/modules/workout/workoutStore.ts` writes to `maganis:workout.custom-exercises`.
   - `src/modules/settings/resetService.ts` was reading and restoring `maganis:custom_exercises`.
   - **Resolution**: Both keys are recognized by the registry. The storage layer and reset service unify them, prioritizing `workout.custom-exercises` and falling back to `custom_exercises` so no existing user data is ever lost.

2. **`maganis:deleted_exercises` vs `maganis:workout.deleted-exercises`**:
   - `src/modules/workout/workoutStore.ts` writes to `maganis:workout.deleted-exercises`.
   - `src/modules/settings/resetService.ts` was reading and restoring `maganis:deleted_exercises`.
   - **Resolution**: Both keys are included in the registry and bridged.

3. **`maganis:onboarding_draft` vs `maganis:profile.draft`**:
   - `OnboardingWizard.tsx` writes `maganis:onboarding_draft`.
   - `profileStore.ts` defines `profile.draft` (`maganis:profile.draft`). Both are classified as transient and safely excluded from snapshots.

## 4. Summary Counts

- **Total Inventory Entries**: 33
- **Included in Snapshot**: 18
- **Excluded from Snapshot**: 15
