import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

/**
 * Storage Inventory specification for Maganis
 * Covers:
 * - localStorage static keys & dynamic prefixes
 * - IndexedDB databases, object stores & keys
 * - sessionStorage usage
 * - Module owner, value shape, kind, snapshot status, and reason
 */

export const STORAGE_ENTRIES = [
  // --- Authored Data (Snapshot: include) ---
  {
    key: 'maganis:profile.active',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/onboarding/profileStore.ts',
    shape: 'UserProfile (id, name, goals, primaryGoal, trainingDaysPerWeek, medical, body)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Primary user profile, physical stats, goals and training preferences.',
  },
  {
    key: 'maganis:workout.program',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/workout/workoutStore.ts',
    shape: 'WorkoutProgram (id, days[], trainingDaysPerWeek, primaryGoal)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Active customized workout program split and exercise prescription.',
  },
  {
    key: 'maganis:workout.custom-exercises',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/workout/workoutStore.ts',
    shape: 'CustomExercise[] (id, nameAr, category, targetSubMuscle, ...)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Custom exercises authored by the user.',
  },
  {
    key: 'maganis:custom_exercises',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/settings/resetService.ts',
    shape: 'CustomExercise[] (legacy duplicate key for workout.custom-exercises)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Legacy key used in resetService; preserved for backwards compatibility and data safety.',
    notes: 'Duplicate / legacy key. resetService should bridge to workout.custom-exercises.',
  },
  {
    key: 'maganis:workout.deleted-exercises',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/workout/workoutStore.ts',
    shape: 'string[] (canonical exercise IDs hidden/deleted by user)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'User customizations hiding default library exercises.',
  },
  {
    key: 'maganis:deleted_exercises',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/settings/resetService.ts',
    shape: 'string[] (legacy duplicate key for workout.deleted-exercises)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Legacy key used in resetService; preserved for data safety.',
    notes: 'Duplicate / legacy key. resetService should bridge to workout.deleted-exercises.',
  },
  {
    key: 'maganis:workout.saved-programs',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/workout/workoutStore.ts',
    shape: 'SavedWorkoutProgram[] (id, title, program, savedAt)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Saved custom workout programs archived in program vault.',
  },
  {
    key: 'maganis:tracking.sessions',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/tracking/trackingStore.ts',
    shape: 'TrackingSession[] (id, date, exercises[], notes, createdAt)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Historical completed workout sessions, weights and reps logged by user.',
  },
  {
    key: 'maganis:tracking.body-log',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/tracking/trackingStore.ts',
    shape: 'BodyLogEntry[] (date, weightKg)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Bodyweight tracking history used for nutrition energy expenditure calibration.',
  },
  {
    key: 'maganis:tracking.notes',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/tracking/trackingStore.ts',
    shape: 'DayNote[] (date, note)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Daily training notes and journal entries authored by user.',
  },
  {
    key: 'maganis:exercise_overrides',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/workout/exerciseOverrides.ts',
    shape: 'Record<string, ExerciseOverride> (customImage, customVideo, notes)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Exercise customizations (custom media references, notes, video links).',
  },
  {
    key: 'maganis:custom_meals',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/nutrition/NutritionModule.tsx',
    shape: 'CustomMeal[] (id, nameAr, category, items[], totalKcal, totalProtein)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Custom meals authored by user in nutrition module.',
  },
  {
    key: 'maganis:custom_food_items',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/nutrition/foodDatabase.ts',
    shape: 'CustomFoodItem[] (id, nameAr, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, ...)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Custom food items authored by user in food database.',
  },
  {
    key: 'maganis:daily_nutrition_',
    prefix: true,
    store: 'localStorage',
    owner: 'src/modules/nutrition/NutritionModule.tsx',
    shape: 'DailyNutritionLog (date, targetCalories, targetProteinG, entries[], ...)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Daily nutrition meal logs and consumed macro trackers for each date.',
  },
  {
    key: 'maganis:theme_mode',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/settings/SettingsScreen.tsx',
    shape: '"light" | "dark" | "system"',
    kind: 'authored',
    snapshot: 'include',
    reason: 'User interface theme mode preference.',
  },
  {
    key: 'maganis:theme',
    prefix: false,
    store: 'localStorage',
    owner: 'src/App.tsx',
    shape: '"light" | "dark"',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Resolved theme token saved across sessions.',
  },
  {
    key: 'maganis:schema_version',
    prefix: false,
    store: 'localStorage / native kv',
    owner: 'src/platform/migrations.ts',
    shape: 'number (integer version, e.g. 1 or 2)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'Data schema version tracking for deterministic data migrations.',
  },
  {
    key: 'idb:maganis_db:maganis_media',
    prefix: true,
    store: 'IndexedDB (store: maganis_media) / native platform.media',
    owner: 'src/lib/indexedStorage.ts',
    shape: 'MediaItem: { mime: string, dataUrl: string } (blobs and data URLs for custom exercise media)',
    kind: 'authored',
    snapshot: 'include',
    reason: 'User-uploaded photos, GIFs, and videos for custom exercises.',
  },

  // --- Transient Data (Snapshot: exclude) ---
  {
    key: 'maganis:active_session',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/workout/ActiveWorkoutSession.tsx',
    shape: 'ActiveSessionState (in-progress workout timer, sets, completed sets)',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Active workout in progress is ephemeral device state; importing into another device or restoring from backup would corrupt live tracking.',
  },
  {
    key: 'maganis:cardio_active_session',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/workout/CardioRunner.tsx',
    shape: 'CardioSessionState (in-progress cardio runner state)',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Active cardio runner session in progress is ephemeral device state.',
  },
  {
    key: 'maganis:onboarding_draft',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/onboarding/OnboardingWizard.tsx',
    shape: 'OnboardingDraft (in-progress onboarding answers)',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Unfinished onboarding wizard state; discarded upon completing onboarding.',
  },
  {
    key: 'maganis:profile.draft',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/onboarding/profileStore.ts',
    shape: 'OnboardingDraft (synonymous with maganis:onboarding_draft)',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Unfinished onboarding wizard state.',
  },
  {
    key: 'maganis:backup_reminder_dismissed',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/dashboard/Dashboard.tsx',
    shape: 'string (timestamp)',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Temporary UI reminder dismiss timestamp; should not persist across devices or overwrite user reminders.',
  },
  {
    key: 'maganis:redflag_dismissed',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/dashboard/Dashboard.tsx',
    shape: '"true" | "false"',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Temporary UI banner dismissal flag.',
  },

  // --- Derived Data (Snapshot: exclude) ---
  {
    key: 'maganis:pre_update_snapshot',
    prefix: false,
    store: 'localStorage + IndexedDB (maganis_kv)',
    owner: 'src/modules/backup/preUpdateSnapshot.ts',
    shape: 'PreUpdateSnapshotMeta ({ takenAt: number, data: BackupData })',
    kind: 'derived',
    snapshot: 'exclude',
    reason: 'Safety rollback snapshot taken automatically before import/restore; derived from current state; packing snapshots inside snapshots causes recursion and bloat.',
  },
  {
    key: 'maganis:g4_snapshot_taken',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/backup/preUpdateSnapshot.ts',
    shape: '"true"',
    kind: 'derived',
    snapshot: 'exclude',
    reason: 'Internal migration one-time flag.',
  },

  // --- Device-Specific Data (Snapshot: exclude) ---
  {
    key: 'maganis:storage_persist_requested',
    prefix: false,
    store: 'localStorage',
    owner: 'src/lib/storagePersist.ts',
    shape: '"true"',
    kind: 'device',
    snapshot: 'exclude',
    reason: 'Browser-specific flag indicating navigator.storage.persist() was requested on this device.',
  },
  {
    key: 'backup.last-export',
    prefix: false,
    store: 'localStorage',
    owner: 'src/modules/backup/backupStore.ts',
    shape: 'string (number timestamp)',
    kind: 'device',
    snapshot: 'exclude',
    reason: 'Timestamp of last backup export performed on this specific device.',
  },
  {
    key: 'idb:maganis_file_sync',
    prefix: false,
    store: 'IndexedDB (db: maganis_file_sync)',
    owner: 'src/lib/liveFileSync.ts',
    shape: 'FileSystemDirectoryHandle (native Chromium file system handle)',
    kind: 'device',
    snapshot: 'exclude',
    reason: 'Web-only device directory handle; cannot be transferred across devices or to Android.',
  },
  {
    key: 'sessionStorage (all)',
    prefix: true,
    store: 'sessionStorage',
    owner: 'src/modules/settings/resetService.ts',
    shape: 'none stored; cleared on reset',
    kind: 'transient',
    snapshot: 'exclude',
    reason: 'Ephemeral browser session memory; cleared on factory reset.',
  },
]

export function generateMarkdownInventory() {
  const includeEntries = STORAGE_ENTRIES.filter((e) => e.snapshot === 'include')
  const excludeEntries = STORAGE_ENTRIES.filter((e) => e.snapshot === 'exclude')

  let md = '# Maganis Storage Inventory & Snapshot Classification\n\n'
  md += `Generated: ${new Date().toISOString()}\n\n`
  md += 'This document is the authoritative inventory of all storage call sites, keys, databases, and session storage uses in Maganis.\n'
  md += 'It defines which keys are included in the complete v2 snapshot and provides the exact architectural justification for exclusions.\n\n'

  md += '## 1. Snapshot INCLUDED Keys (Authored User Data)\n\n'
  md += 'Every key in this table is user-authored and guaranteed to be preserved across backups, migrations, and PWA-to-native transfer.\n\n'
  md += '| Key / Prefix | Store | Owner Module | Value Shape | Kind | Reason |\n'
  md += '| :--- | :--- | :--- | :--- | :--- | :--- |\n'
  for (const e of includeEntries) {
    const keyDisplay = e.prefix ? `\`${e.key}*\`` : `\`${e.key}\``
    md += `| ${keyDisplay} | ${e.store} | \`${e.owner}\` | ${e.shape} | \`${e.kind}\` | ${e.reason} |\n`
  }

  md += '\n## 2. Snapshot EXCLUDED Keys (Transient, Derived, and Device-Specific)\n\n'
  md += '| Key / Prefix | Store | Owner Module | Kind | Snapshot | Reason for Exclusion |\n'
  md += '| :--- | :--- | :--- | :--- | :--- | :--- |\n'
  for (const e of excludeEntries) {
    const keyDisplay = e.prefix ? `\`${e.key}*\`` : `\`${e.key}\``
    md += `| ${keyDisplay} | ${e.store} | \`${e.owner}\` | \`${e.kind}\` | \`${e.snapshot}\` | ${e.reason} |\n`
  }

  md += '\n## 3. Discovered Duplicates, Inconsistencies & Legacy Keys\n\n'
  md += 'During the inventory audit, the following key discrepancies were identified in the codebase:\n\n'
  md += '1. **`maganis:custom_exercises` vs `maganis:workout.custom-exercises`**:\n'
  md += '   - `src/modules/workout/workoutStore.ts` writes to `maganis:workout.custom-exercises`.\n'
  md += '   - `src/modules/settings/resetService.ts` was reading and restoring `maganis:custom_exercises`.\n'
  md += '   - **Resolution**: Both keys are recognized by the registry. The storage layer and reset service unify them, prioritizing `workout.custom-exercises` and falling back to `custom_exercises` so no existing user data is ever lost.\n\n'
  md += '2. **`maganis:deleted_exercises` vs `maganis:workout.deleted-exercises`**:\n'
  md += '   - `src/modules/workout/workoutStore.ts` writes to `maganis:workout.deleted-exercises`.\n'
  md += '   - `src/modules/settings/resetService.ts` was reading and restoring `maganis:deleted_exercises`.\n'
  md += '   - **Resolution**: Both keys are included in the registry and bridged.\n\n'
  md += '3. **`maganis:onboarding_draft` vs `maganis:profile.draft`**:\n'
  md += '   - `OnboardingWizard.tsx` writes `maganis:onboarding_draft`.\n'
  md += '   - `profileStore.ts` defines `profile.draft` (`maganis:profile.draft`). Both are classified as transient and safely excluded from snapshots.\n\n'

  md += '## 4. Summary Counts\n\n'
  md += `- **Total Inventory Entries**: ${STORAGE_ENTRIES.length}\n`
  md += `- **Included in Snapshot**: ${includeEntries.length}\n`
  md += `- **Excluded from Snapshot**: ${excludeEntries.length}\n`

  return md
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const md = generateMarkdownInventory()
  const outPath = resolve(rootDir, 'docs/STORAGE-INVENTORY.md')
  writeFileSync(outPath, md, 'utf-8')
  console.log(`Successfully generated ${outPath} (${STORAGE_ENTRIES.length} entries)`)
}
