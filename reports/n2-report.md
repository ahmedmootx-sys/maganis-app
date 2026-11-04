# Task N2 Report: Durable Storage, Full Snapshot, and PWA-to-App Data Transfer

**Task ID:** N2  
**Branch:** `native/n2`  
**Status:** Completed  
**Date:** 2026-11-04  
**App Latin Name:** Maganis  
**App Arabic Name:** «مجانص»

---

## 1. Executive Summary

Task N2 ensures the Maganis (مجانص) Android application wrapped with Capacitor 8 guarantees persistent user data preservation with zero silent data loss. WebView transient storage (`localStorage` and `indexedDB`) is decoupled from native execution and replaced with atomic, fsynced files stored directly in app-private storage (`getFilesDir()/maganis/kv/` and `getFilesDir()/maganis/media/`).

A comprehensive Snapshot V2 format was engineered that captures 100% of user-authored data—including custom meals, custom foods, daily nutrition logs, custom exercises, exercise overrides, video links, media uploads, and theme preferences. In the event of catastrophic storage failure or corruption, the app enters a visible, non-destructive Arabic Read-Only Recovery Mode («مش قادر أقرأ بياناتك. بياناتك لسه موجودة ومتمسحتش») rather than silently overwriting user state with fresh defaults.

---

## 2. Files Changed & Added

### Platform & Native Core

- `android/app/src/main/java/app/maganis/coach/DurableFileStore.java`: Plain Java atomic file store (zero Android framework dependencies) with reversible hex key encoding, `.tmp` fsync, re-read SHA-256 validation, `.bak` rotation, atomic rename, corrupt file preservation (`.corrupt-<epoch>`), recovery priority (`json` -> `bak` -> `tmp`), and `FaultInjector` hook.
- `android/app/src/test/java/app/maganis/coach/DurableFileStoreTest.java`: 14 JVM unit tests covering key encoding reversibility, fault injection at all 12 write steps, corrupt file recovery via `.bak`, zero-byte detection, 500-write sequential integrity, and multithreaded concurrent writer safety.
- `android/app/src/main/java/app/maganis/coach/MaganisNative.java`: Capacitor plugin methods `kvReadAll`, `kvWrite`, `kvWriteChunk`, `kvRemove`, `kvClear`, `kvStats`, `mediaGet`, `mediaSet`, `mediaRemove`, `mediaGetAll`, `mediaUsage` with serialized single-thread worker.
- `src/platform/native/durableKv.ts`: Async write queue with latest-value-wins coalescing, 50ms dispatch timer, `flush()`, chunking for payloads > 1 MB, and dependency injection for testing.
- `src/platform/native/maganisNative.ts`: TypeScript interfaces and web fallback mock for all native methods.
- `src/platform/storage.ts`: `appStorage` DOM `Storage` interface with in-memory map + write-through to `durableKv` on native, passthrough on web, and change event subscriptions.
- `src/platform/storageHealth.ts`: `StorageHealthManager` tracking status (`ok`, `degraded`, `readonly`, `corrupt`), corrupt keys, disk stats, error logs, and `useStorageHealth()` React hook with cached snapshots.
- `src/platform/storageRegistry.ts`: Authoritative typed storage registry defining all 30 keys, storage tiers, lifecycles, and Zod validation schemas.
- `src/platform/bootstrap.ts`: Pre-render platform bootstrap executing native KV hydration, recording recovery events, querying disk stats, and running schema migrations.
- `src/platform/migrations.ts`: Deterministic schema migration runner with safety backup rollback and v1->v2 bridge migration.
- `src/platform/index.ts`: Activated `platform.kv` and `platform.media` implementations.

### UI & Recovery Components

- `src/components/RecoveryModeScreen.tsx`: Arabic read-only recovery screen («مش قادر أقرأ بياناتك. بياناتك لسه موجودة ومتمسحتش») with Retry, Restore from snapshot file, and Export raw files.
- `src/components/StorageHealthBanner.tsx`: Non-dismissible top banner alerting user when storage status is degraded or corrupt, with action button to open diagnostics.
- `src/components/StorageDiagnosticsSheet.tsx`: Diagnostics sheet displaying health status, free disk space, key count, last write timestamp, and error logs without exposing stored user values.
- `src/modules/backup/PwaTransferSection.tsx`: Transfer panel providing Snapshot V2 export on web and Snapshot V2 preview/validation/import on native.
- `src/main.tsx`: Updated to await `bootstrapPlatform()` before `createRoot().render()`; renders `RecoveryModeScreen` if bootstrap fails.
- `index.html`: Added inline dark theme brand loader (`#12171f`, `#F95700`) to prevent white flash during bootstrap hydration.

### Module Call Site Migrations

- `eslint.config.js`: AST rule banning bare `localStorage`, `window.localStorage`, and `indexedDB` across `src/`.
- `src/modules/backup/snapshot.ts`: `buildSnapshot()`, `validateSnapshot()`, and transactional `applySnapshot()` with manifest hashes, per-key Zod schemas, v1 backwards compatibility, and automatic rollback on verification failure.
- `src/modules/backup/preUpdateSnapshot.ts`: Throttled to max 1 write/day or on force, using `buildSnapshot()` and `appStorage`.
- `src/modules/settings/resetService.ts`: Replaced bare storage with `appStorage`, bridges `custom_exercises` with `workout.custom-exercises`, wipes native stores on `delete-all`, and introduced `registerResetHook()`.
- `src/lib/indexedStorage.ts`: Updated to delegate to native KV (`idb/*`) and native media files when `isNative()`.
- `src/lib/storage.ts`: `createStorage` updated to wrap `appStorage`.
- `src/lib/storagePersist.ts`: Updated to wrap `appStorage`, no-op on native.
- `src/lib/liveFileSync.ts`: Updated to delegate handle storage to `indexedStorage` without bare `indexedDB`, disabled on native.
- `src/modules/backup/backupStore.ts`: Updated to use `appStorage`.
- Call site migrations to `appStorage`: `src/modules/nutrition/foodDatabase.ts`, `src/modules/nutrition/NutritionModule.tsx`, `src/modules/onboarding/OnboardingWizard.tsx`, `src/modules/dashboard/Dashboard.tsx`, `src/modules/reports/Reports.tsx`, `src/modules/settings/SettingsScreen.tsx`, `src/modules/workout/exerciseOverrides.ts`, `src/modules/tracking/SessionLogger.tsx`, `src/modules/workout/ActiveWorkoutSession.tsx`, `src/modules/workout/CardioRunner.tsx`, `src/modules/workout/WeeklyPlanView.tsx`, and `src/App.tsx`.
- CI: `.github/workflows/android.yml` updated with `./gradlew testDebugUnitTest --stacktrace`.

### Tests & Tooling

- `tools/storage-inventory.mjs`: Automated scanner generating `docs/STORAGE-INVENTORY.md`.
- `scripts/test-snapshot-completeness.mjs`: Measure red/green round-trip completeness.
- `src/platform/snapshotCompleteness.test.ts`: Permanent Vitest completeness and tamper-rejection test.
- `src/platform/durableKv.test.ts`: Write queuing, 50ms coalescing, and chunking test.
- `src/platform/migrations.test.ts`: Schema migration v1->v2 and safety backup test.
- `src/modules/workout/exerciseOverridesStorageFailure.test.ts`: Persistence error rollback test.

---

## 3. Items & Evidence Table

| Item ID   | Description                                   | Red Evidence                                                                          | Green Evidence                                                                                                                        | Gate / Verification                                                  | Status   |
| :-------- | :-------------------------------------------- | :------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------- | :------- |
| **N2.1**  | Storage Inventory & Registry                  | `evidence/n2/red/snapshot-completeness.txt` (12 user-authored keys lost in v1 export) | `docs/STORAGE-INVENTORY.md`, `src/platform/storageRegistry.ts`, `evidence/n2/green/snapshot-completeness.txt`                         | `node scripts/test-snapshot-completeness.mjs --v2` (19/19 preserved) | **DONE** |
| **N2.2**  | ESLint Storage Rule Banning Bare Storage      | `evidence/n2/red/eslint-storage-rule.txt` (97 restricted-storage errors)              | `evidence/n2/green/eslint-storage-rule.txt` (0 errors)                                                                                | `npm run lint`                                                       | **DONE** |
| **N2.3**  | Native Atomic DurableFileStore & Bridge       | Pre-fix: WebView `localStorage` lost on clear-cache                                   | `android/.../DurableFileStore.java`, `android/.../DurableFileStoreTest.java`, `src/platform/durableKv.test.ts`                        | 14 JVM tests in CI, `vitest run src/platform/durableKv.test.ts`      | **DONE** |
| **N2.4**  | Health Manager, Banner & Diagnostics          | Pre-fix: silent failures without banner or logs                                       | `src/platform/storageHealth.ts`, `src/components/StorageHealthBanner.tsx`, `src/components/StorageDiagnosticsSheet.tsx`               | `npm run check:ui` (108/108 checks passed)                           | **DONE** |
| **N2.5**  | Bootstrap Hydration & Recovery Mode           | Pre-fix: white flash, silent fallback to fresh visitor                                | `src/platform/bootstrap.ts`, `src/components/RecoveryModeScreen.tsx`, `index.html` inline dark loader                                 | `vitest run src/platform/platform.test.ts`                           | **DONE** |
| **N2.6**  | Snapshot V2 Completeness & Integrity          | `evidence/n2/red/snapshot-completeness.txt` (12 keys lost)                            | `evidence/n2/green/snapshot-completeness.txt` (0 keys lost), `src/platform/snapshotCompleteness.test.ts`                              | `vitest run src/platform/snapshotCompleteness.test.ts`               | **DONE** |
| **N2.7**  | Schema Migrations & Transactional Rollback    | Pre-fix: no schema versioning, uncoordinated resets                                   | `src/platform/migrations.ts`, `src/platform/migrations.test.ts`                                                                       | `vitest run src/platform/migrations.test.ts`                         | **DONE** |
| **N2.8**  | PWA-to-App Transfer Panel & Onboarding Import | Pre-fix: no way to import PWA data on native app                                      | `src/modules/backup/PwaTransferSection.tsx`, `src/modules/settings/SettingsScreen.tsx`, `src/modules/onboarding/OnboardingWizard.tsx` | `npm run check:ui` & `qa/backup-restore.mjs`                         | **DONE** |
| **N2.9**  | JVM Unit Tests in GitHub Actions CI           | Pre-fix: no JVM tests in CI pipeline                                                  | `.github/workflows/android.yml` (`testDebugUnitTest`)                                                                                 | CI workflow execution                                                | **DONE** |
| **N2.10** | Data Safety Rules Compliance (D1-D5)          | Pre-fix: unhandled writes, silent catches                                             | `src/modules/workout/exerciseOverridesStorageFailure.test.ts`, `qa/reset-flow.mjs`                                                    | 60 test files (563 tests) passed                                     | **DONE** |

---

## 4. Verification Methods

| Claim                                                          | Method Label       | Evidence                                                                                            |
| :------------------------------------------------------------- | :----------------- | :-------------------------------------------------------------------------------------------------- |
| Zero bare `localStorage` or `indexedDB` calls outside platform | unit test / lint   | `evidence/n2/green/eslint-storage-rule.txt` (ESLint: 0 errors)                                      |
| 100% authored data preserved round-trip                        | unit test          | `src/platform/snapshotCompleteness.test.ts` (passed), `evidence/n2/green/snapshot-completeness.txt` |
| Write coalescing & 1 MB chunking                               | unit test          | `src/platform/durableKv.test.ts` (3/3 passed)                                                       |
| Storage failure rollback & memory integrity                    | unit test          | `src/modules/workout/exerciseOverridesStorageFailure.test.ts` (2/2 passed)                          |
| Schema migration v1->v2                                        | unit test          | `src/platform/migrations.test.ts` (2/2 passed)                                                      |
| Full Vitest unit test suite                                    | unit test          | 60 passed test files, 563 passed tests (`evidence/n2/green/test-suite.txt`)                         |
| UI Quality Gates on production build                           | Playwright E2E     | 108/108 checks passed (`npm run check:ui`)                                                          |
| Native bundle smoke across 8 routes                            | Playwright E2E     | 8/8 routes passed (`qa/native-web-smoke.mjs`)                                                       |
| DurableFileStore Java atomic operations & fault injection      | CI run / unit test | `android/.../DurableFileStoreTest.java` wired into `.github/workflows/android.yml`                  |
| Privacy and no personal data                                   | gate check         | `scripts/gate-no-personal-data.mjs` (passed, 1,405 files checked)                                   |

---

## 5. Sizing & Dependency Impact

- **New Dependencies:** 0 external npm dependencies added (no `@capacitor/filesystem`, no `@capacitor/preferences`). All native persistence is implemented via Java `DurableFileStore` inside `MaganisNative`.
- **Web Production Bundle (raw):**
  - Before N2 (`main`): `dist/assets/index-*.js`: ~605.5 kB
  - After N2 (`native/n2`): `dist/assets/index-CthCPkOV.js`: 608.02 kB
  - **Delta (raw):** +2.52 kB (+0.4%)
- **Web Production Bundle (gzip):**
  - Before N2 (`main`): ~162.27 kB
  - After N2 (`native/n2`): 162.51 kB
  - **Delta (gzip):** +0.24 kB (+0.1%)
- **Native Android APK Size:** ~6.8 MB (debug build in CI).

---

## 6. What Was False

1. **`custom_exercises` vs `workout.custom-exercises` Discrepancy:**
   - In `workoutStore.ts`, the keys were named `maganis:workout.custom-exercises` and `maganis:workout.deleted-exercises`.
   - However, in `resetService.ts` and earlier reset flows, the code was reading and writing `maganis:custom_exercises` and `maganis:deleted_exercises`.
   - Consequence: If a user reset the app with "keep-edits", their custom exercises were silently wiped out because the keys did not match.
   - Fix: Both keys were registered in `storageRegistry.ts`, bridged in `migrations.ts` (v1 -> v2), and synchronized in `resetService.ts`.
2. **Pre-Update Snapshot Write Spikes:**
   - In `App.tsx`, `useEffect(() => takePreUpdateSnapshot(handleBackupData), [handleBackupData])` was called whenever `handleBackupData` changed reference (e.g. on every set logged during a workout), causing massive write churn and potential quota exhaustion.
   - Fix: Throttled snapshot creation to a maximum of once per 24 hours on boot, or explicitly on force (before restores/migrations).
3. **V1 Backup Export Completeness:**
   - Previous reports claimed backups were "complete". In reality, the v1 export completely omitted custom meals, custom foods, daily nutrition logs, theme preferences, and media blobs. All are now fully captured in Snapshot V2.

---

## 7. What Was Not Done & Assumptions

- **Local JVM Test Execution:** The local developer environment (Windows) has no JDK (`java`) and no Android SDK installed. JVM tests (`DurableFileStoreTest.java`) cannot be run locally without the toolchain; they are executed on Ubuntu runner via GitHub Actions CI (`./gradlew testDebugUnitTest --stacktrace`).
- **Physical Phone Verification:** Cannot be performed by the AI agent. Physical phone verification is left to the repository owner using the simple Egyptian Arabic checklist below.
- **Task Scope Boundaries:** Native backup guarantees (Google Drive / Auto Backup rules) belong to Task N3. Push/local notifications belong to Task N4.

---

## 8. Arabic Phone Checklist for the Owner (قائمة فحص الموبايل)

يا كابتن، بعد ما الـ CI يخلص بناء نسخة الـ APK على GitHub، حمّل النسخة وجرب الخطوات دي على موبايلك بالترتيب:

1. **تأكيد شاشة البداية بدون وميض أبيض:**
   - افتح تطبيق Maganis على الموبايل وهو في الوضع الداكن (Dark Mode).
   - اتأكد إن أول ثانية من فتح التطبيق شاشة سودا هادية (`#12171f`) مع لوجو مجانص بدون أي وميض أبيض في الشاشة.
2. **تصدير نسخة كاملة (Snapshot v2) من الويب:**
   - افتح نسخة الموقع الحالية (PWA) من المتصفح على موبايلك.
   - ادخل على: الإعدادات ← البيانات والمزامنة ← «الانتقال إلى تطبيق الموبايل».
   - اضغط «تصدير ملف النسخة الشاملة (Snapshot v2)» وتأكد إن الملف نزل في التنزيلات.
3. **استيراد النسخة داخل تطبيق الموبايل المثبت:**
   - افتح تطبيق الموبايل Maganis.
   - ادخل على: الإعدادات ← البيانات والمزامنة ← «استيراد نسخة PWA إلى التطبيق».
   - اختر الملف اللي نزلته. اتأكد إنه بيعرضلك معاينة بالأرقام الحقيقية (عدد التمارين، الوجبات، الجلسات) قبل ما تدوس «تطبيق واستيراد».
   - اضغط «تطبيق واستيراد» وتأكد إن كل بياناتك ظهرت كاملة بما فيها وجباتك المخصصة وصور التمارين.
4. **تجربة الاستيراد في شاشة البداية الأولى (Fresh Install):**
   - لو ثبت التطبيق لأول مرة أو مسحت بياناته، في أول خطوة من معالج البداية هتلاقي سطر: «عندك نسخة احتياطية سابقة؟ استرجع بياناتك من هنا».
   - اضغط عليه واختار ملف النسخة، وتأكد إن التطبيق بيسترجع حسابك وجدولك فوراً بدون ما تحتاج تملأ البيانات من الأول.
5. **اختبار حفظ التعديلات والخروج الفجائي (Process Kill):**
   - ادخل على أي تمرين وعدّل ملاحظة أو ضيف فيديو أو سجل مجموعة في جلسة تمرين.
   - اخرج من التطبيق فوراً واقفل التطبيق من شاشة التطبيقات المفتوحة (Swipe away / Force stop).
   - افتح التطبيق تاني، وتأكد إن آخر رقم أو ملاحظة كتبتها موجودة ومتمسحتش.
6. **فحص شاشة تشخيص التخزين (Storage Diagnostics):**
   - ادخل على الإعدادات ← عن التطبيق ← اضغط على تفاصيل النظام.
   - اتأكد إن حالة التخزين مكتوبة «سليم (مستقر)» ومساحة التخزين المتوفرة ظاهرة بالميجابايت.
7. **إعادة ضبط مع الاحتفاظ بالتعديلات (Keep Edits Reset):**
   - ادخل على الإعدادات ← منطقة الخطر ← إعادة ضبط المصنع.
   - اختر «احتفظ بتعديلات التمارين» واكتب كلمة «حذف».
   - بعد إعادة التشغيل، ادخل على التمارين وتأكد إن تمارينك المخصصة وفيديوهاتك لسه موجودة زي ما هي ومطارتش.
8. **التأكد من عدم وجود لاج أو تهنيج:**
   - اتنقل بين الأيام والتغذية ومكتبة التمارين، وتأكد إن التنقل سريع وسلس بدون أي وقفة أو شاشة بيضاء.
