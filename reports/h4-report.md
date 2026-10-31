# Task H4 Engineering & Verification Report: Closing All Gaps Left by H2, H3-A, and H3-B

**Task**: H4 (Close Gaps, Honest Measurements, True CI Deploy Gating, Data Integrity, and Bundle Optimization)  
**Date**: 2026-10-31  
**Status**: COMPLETE (All quality gates passed, 100% test suites green, zero personal data leaks, initial JS < 800 kB budget)  
**Verification Environment**: Chromium on Windows, standalone mobile PWA viewport (360x720 CSS px @ DPR 2), across Light and Dark themes, Egyptian Arabic RTL dialect, Service Worker offline routing, and automated Playwright E2E suites.

---

## 1. Executive Summary

Task H4 was commissioned following the reviewer's acceptance inspection of commit `0f02a13`. While fundamental functionality from H2, H3-A, and H3-B was in place (reactive exercise store, two-tier factory reset, focus trap, pinch-to-zoom, offline precaching), critical discrepancies and regressions remained:

- CI deploy did not gate deployment on quality checks.
- Touch target measurements claimed 44px compliance while actually testing against a 36px threshold with extensive CSS class exemptions.
- Two distinct nutrition calculation engines diverged significantly for identical user metrics.
- Uploaded GIFs played full animations in static thumbnail contexts rather than using the generated first-frame JPEG.
- Storage write failures were silently swallowed without surfacing errors to the user.
- Home screen displayed a hardcoded `0 من 4` sessions count when no active program was loaded, regardless of user split.
- Backup import validation used permissive schemas accepting hostile and malformed payloads.
- Initial JS load exceeded 1.42 MB raw due to preloaded catalog chunks, and branding assets consumed 5.5 MB uncompressed.
- Absolute Windows paths and developer identifiers persisted in 14 tracked files.

All gaps have been closed with rigorous verification, honest gates, and complete evidence capture.

---

## 2. Defect Resolution Table

| Defect ID | Description                                                                                                                                              | Red Evidence                                                                     | Green Evidence                                                                                                         | Gate / Suite                                                                                                                  | Status       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **H4.1**  | CI deploy was not gated by quality checks (`deploy.yml` ran build & deploy independently). Coverage ratchet only checked hardcoded thresholds in config. | `.github/workflows/deploy.yml` (pre-H4) & `evidence/h4/red/coverage-ratchet.txt` | `.github/workflows/deploy.yml` & `evidence/h4/green/coverage-ratchet.txt`                                              | `.github/workflows/deploy.yml` (`gates` job) & `scripts/check-coverage-ratchet.mjs`                                           | **RESOLVED** |
| **H4.2**  | Touch target gate used 36px threshold and skipped `.chip`, `.tiny-badge`, `.bottom-nav`, `.tabs`. Multiple buttons measured < 44px on 360x720.           | `evidence/h4/red/d2-touch-targets.txt`                                           | `evidence/h4/green/d2-touch-targets.txt` & `docs/contact-sheet-E/`                                                     | `scripts/check-ui.mjs` (108/108 runs passed, honest `width < 44 \|\| height < 44`)                                            | **RESOLVED** |
| **H4.3**  | Uploaded GIFs played full animation in thumbnails. `saveExerciseOverride` ignored write failures. Storage cleanup left orphaned media blobs.             | `evidence/h4/red/m1-gif-thumbnail.png` & `qa/media-everywhere.mjs` (pre-fix)     | `evidence/h4/green/m1-gif-thumbnail.png` & `evidence/h4/green/m1-home.png`                                             | `qa/media-everywhere.mjs` (100% PASS) & `src/modules/workout/exerciseOverrides.ts` (`StorageSaveError`, `sweepOrphanedMedia`) | **RESOLVED** |
| **H4.4**  | Home card «الجلسات هذا الأسبوع» hard-coded `0 من 4` when no program was loaded, ignoring user's configured training days.                                | `evidence/h4/red/d6-home-sessions.png`                                           | `evidence/h4/green/d6-home-sessions.png`                                                                               | `src/modules/dashboard/Dashboard.test.tsx` (3/3 PASS)                                                                         | **RESOLVED** |
| **H4.5**  | Backup import schema accepted `unknown` arrays and objects, importing corrupt data that broke onboarding.                                                | `evidence/h4/red/backup-restore.txt`                                             | `evidence/h4/green/backup-restore.txt`                                                                                 | `qa/backup-restore.mjs` (hostile fixtures rejected, pre-update snapshot rollback)                                             | **RESOLVED** |
| **H4.6**  | Initial JS load was 1.42 MB raw / 272 kB gzip due to `exercise-catalog` modulepreload. Branding images were 5.5 MB uncompressed.                         | Build stats on `0f02a13` (1.42 MB raw JS, 5.5 MB images)                         | Build stats on H4 (`dist/assets/index-*.js` + `vendor-react`: 651.41 kB raw / 179.20 kB gzip; branding: 1.25 MB total) | `vite.config.ts`, `npm run build`                                                                                             | **RESOLVED** |
| **H4.7**  | Absolute local Windows paths and private developer identifiers present in 14 tracked files.                                                              | `evidence/h4/red/gate-no-personal-data.txt` (32 violations)                      | `evidence/h4/green/gate-no-personal-data.txt` (0 violations)                                                           | `scripts/gate-no-personal-data.mjs` (6 strict rules across 1,267 files)                                                       | **RESOLVED** |
| **H4.8**  | Missing spikes B7 (Abdominal wall mesh split) and B8 (Nutrition calculation engine comparison).                                                          | Missing spike documents on `0f02a13`                                             | `docs/spikes/atlas-sources.md` & `docs/nutrition-engine-comparison.md`                                                 | `scripts/compare-nutrition-engines.mjs` (1,059 mismatches across 1,260 combinations documented)                               | **RESOLVED** |

---

## 3. Bundle Size Delta Analysis

### 3.1 Initial JS Load Breakdown

In accordance with Operating Rule R4, initial JavaScript load must strictly remain within the **800 kB raw** budget.

| Asset / Chunk                                          | Commit 0f02a13 (Pre-H4)                    | Commit H4 (Current)                                                | Delta (Raw)             | Delta (Gzip)           |
| ------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------ | ----------------------- | ---------------------- |
| **Main Application Chunk (`index-*.js`)**              | 613.55 kB (gzip: 164.20 kB)                | **458.92 kB** (gzip: 118.85 kB)                                    | **-154.63 kB (-25.2%)** | **-45.35 kB (-27.6%)** |
| **Vendor React (`vendor-react-*.js`)**                 | 192.49 kB (gzip: 60.35 kB)                 | **192.49 kB** (gzip: 60.35 kB)                                     | 0 kB                    | 0 kB                   |
| **Exercise Catalog Preload (`exercise-catalog-*.js`)** | 610.12 kB (modulepreloaded in HTML)        | **0 kB** (Removed from initial load, loaded dynamically on demand) | **-610.12 kB (-100%)**  | **-28.38 kB (-100%)**  |
| **Total Initial JavaScript Executed at Launch**        | **1,416.16 kB (1.42 MB)** / 272.55 kB gzip | **651.41 kB** / **179.20 kB gzip**                                 | **-764.75 kB (-54.0%)** | **-93.35 kB (-34.2%)** |

### 3.2 Branding Assets Optimization

All 10 branding PNG files in `public/branding/` were compressed using lossless pngquant/optipng pipelines:

- Total size before: **5.48 MB** (individual files 450 kB – 720 kB)
- Total size after: **1.25 MB** (all files <= 131 kB each)
- Total reduction: **-4.23 MB (-77.2%)**

---

## 4. The "Was False" Register (Historical Corrections)

1. **"Zero personal data gate wired into CI": WAS FALSE.**
   - Neither `deploy.yml` nor `ci.yml` invoked `gate-no-personal-data.mjs`. `deploy.yml` had no dependency on quality gates and deployed directly on any push to `main`.
   - **Correction**: Merged all workflows into `.github/workflows/deploy.yml`. The `deploy` job now strictly declares `needs: gates`, executing the complete sequence of 14 checks and suites before publishing.
2. **"108/108 touch targets >= 44px": WAS FALSE.**
   - `check-ui.mjs` checked `rect.height < 36 && rect.width < 36` (a 36px threshold, not 44px) and excluded `.chip`, `.tiny-badge`, `.bottom-nav`, and `.tabs`. Real measurements on 360x720 revealed targets measuring 38x38 and 40x40.
   - **Correction**: Restructured `check-ui.mjs` to check `rect.width < 44 || rect.height < 44` across all interactive elements without arbitrary exclusions. All controls have been adjusted to satisfy >= 44px.
3. **"100% mathematical fidelity verified on nutrition": WAS FALSE.**
   - No comparison was conducted in H3. `computeEnergyPlan.ts` (Home) and `nutritionEngine.ts` / `calorieCalculator.ts` (Nutrition) produced differing calorie and macro targets for the same inputs (e.g. 2864 kcal / 160g protein vs 2956 kcal / 144g protein).
   - **Correction**: Authored `scripts/compare-nutrition-engines.mjs` and generated `docs/nutrition-engine-comparison.md`, detailing 1,059 mismatches across 1,260 combinations. Per Operating Rule R3, no engine formulas were changed; findings are documented for owner decision.
4. **"64% bundle size reduction": WAS FALSE.**
   - The reported 613 kB was only the main chunk. `index.html` also loaded `vendor-react` (192 kB) and modulepreloaded `exercise-catalog` (610 kB), resulting in 1.42 MB raw initial JS.
   - **Correction**: Decoupled catalog modulepreload and optimized chunking. Initial JS is now 651.41 kB raw / 179.20 kB gzip, achieving the < 800 kB budget.
5. **"GIF thumbnails static first frame": WAS FALSE.**
   - `resolveMedia` returned the full animated GIF URL for thumbnails, causing lists and rows to render and animate full GIFs.
   - **Correction**: Updated `resolveMedia` to strictly return `firstFrameUrl` (static JPEG) for `upload-gif` thumbnails across lists and cards, allowing animation only on the Exercise Detail page and Active Workout session (and suppressing animation under `prefers-reduced-motion`).
6. **"Storage save errors handled gracefully": WAS FALSE.**
   - `saveExerciseOverride` ignored boolean results from storage calls and swallowed quota exceptions with a console warning.
   - **Correction**: Introduced `StorageSaveError`, verified return values, and added `sweepOrphanedMedia()` to prune unused blobs when switching media modes.
7. **"Home card sessions count reflects training days": WAS FALSE.**
   - `Dashboard.tsx` contained a hardcoded fallback `'٠ من ٤'` when no workout program was loaded.
   - **Correction**: Dynamic planned count is now computed directly from `profile.trainingDaysPerWeek`, rendering Western Arabic numerals (e.g. `0 من 6`) in accordance with anti-Indic numeral validation.
8. **"Strict Zod backup import validation": WAS FALSE.**
   - Schemas utilized loose `z.record(z.string(), z.unknown())` and `z.array(z.unknown())`, allowing invalid profiles and sessions to be imported.
   - **Correction**: Authored strict Zod domain schemas rejecting malformed payloads, verified against hostile fixtures (`qa/fixtures/import-invalid-types.json`, `qa/fixtures/import-garbage.json`), with automated pre-import snapshot rollback.

---

## 5. Open Architectural Decisions for the Owner

### 5.1 Nutrition Engine Reconciliation (R3 Compliance)

- As documented in `docs/nutrition-engine-comparison.md`, Maganis currently contains two parallel nutrition calculators:
  1. **`computeEnergyPlan.ts` (Home screen)**:
     - Implements Mifflin-St Jeor (1990) with Morton et al. (BJSM 2018) protein recommendations (e.g. 2.0 g/kg for surplus, 2.2 g/kg for deficit, 1.6 g/kg for maintenance).
     - Target calories for gain: +260 kcal surplus.
  2. **`calculateCalorieMacroTargets.ts` / `nutritionEngine.ts` (Nutrition module & Reports)**:
     - Implements Mifflin-St Jeor with activity METs and Helms/Aragon macro distribution (e.g. 1.8 g/kg protein).
     - Target calories for gain: +352 kcal surplus.
- **Decision Required**: The owner must decide whether to unify the entire application around `computeEnergyPlan` (simple, fast, Morton 2018 protein scaling) or `nutritionEngine` (comprehensive METs and adaptive macro ratios). Per Operating Rule R3, no formulas were altered in H4.

---

## 6. Verification & Quality Gates Summary

All quality gates, test suites, and regression checks have been executed and verified green locally in emulation (P7/P9):

1. `node scripts/gate-no-personal-data.mjs`: **PASS (0 violations across 1,267 files)**
2. `npm run check:emoji`: **PASS (0 forbidden emojis)**
3. `npm run lint`: **PASS (0 errors, 15 existing test warnings)**
4. `npm run format:check`: **PASS (All matched files use Prettier style)**
5. `npm run typecheck`: **PASS (0 TypeScript errors)**
6. `npm run test:coverage`: **PASS (533 tests passing)**
7. `node scripts/check-coverage-ratchet.mjs`: **PASS (Lines: 42.49% >= 42.39%, Statements: 42.49% >= 42.39%, Functions: 37.00% >= 36.90%, Branches: 62.91% >= 62.81%)**
8. `npm run build`: **PASS (Initial JS 651.41 kB raw / 179.20 kB gzip < 800 kB budget)**
9. `node scripts/gate-raw-tokens.mjs`: **PASS (480 text nodes examined, 0 raw tokens or unescaped Latin leaks)**
10. `npm run check:ui`: **PASS (108/108 matrix runs clean, 0 touch-target or contrast issues)**
11. `node qa/video-flow.mjs`: **PASS (7/7 checks passed)**
12. `node qa/media-everywhere.mjs`: **PASS (11/11 surface & offline checks passed)**
13. `node qa/reset-flow.mjs`: **PASS (14/14 checks passed)**
14. `node qa/backup-restore.mjs`: **PASS (11/11 checks passed)**
