# MAGANIS TASK G5-B REPORT: FEATURES

## 1. Overview & Executive Summary
Task G5-B implements four major feature domains requested by the owner, adhering to all operating rules (R1 to R14):
- **B1. Cardio Session**: Scientific energy expenditure engine based on Ainsworth et al. 2011 (Compendium of Physical Activities), setup interface with the 6 standard activities and 3 intensity levels, duration stepper + direct input, live Gross & Net estimate card with caveat claim and info sheet, 3-2-1 countdown overlay with vibration and motion reduction, live timestamp-delta counter with progress ring, Screen Wake Lock API integration, IndexedDB state persistence across app reloads, finish summary, and session logging with proper Arabic plurals (`plural()`).
- **B2. Set Auto-Propagation & Scientific Suggestions**: Forward-only set value propagation across sets $j > i$ for `empty`, `suggested`, or `auto` cells; immutable `user` and `done` cells; immediate undo toast action ("اتنقلت لباقي المجموعات" with "تراجع"); science-backed suggestions based on Helms et al. 2016 (`sugg.first_time_weight`), ACSM 2009 progression models (`sugg.progress`), and coach guidance (`sugg.below_range`) with zero invented starting weights.
- **B3. Explanation Video Links**: Strict HTTPS URL parser supporting YouTube (`youtube-nocookie.com/embed/ID`), Vimeo (`player.vimeo.com/video/ID`), and direct video files (`.mp4`, `.webm`, `.m4v`); external fallback for unlisted hosts; facade player with zero DOM iframes until tap; offline awareness; 10s timeout fallback; CSP update without widening `script-src`; service worker video cache bypass.
- **B4. Copy Name & Overrides Layer**: 3-tier clipboard copy helper with Arabic/English options; prominent 3 actions on the "no image" placeholder; non-mutating `exerciseOverrides` layer in IndexedDB with single selector `selectEffectiveExercise`; canvas-based image resizer (max 640px, EXIF stripping, 10 images / 5MB quota); «معدّل» badge; complete edit sheet with revert action; backup export and validated import.
- **B5. Automated Verification**: 100% green test suite (40 test files, 275 tests), pixel-level clipping gate passing 132 states & 4,524 elements with 0 violations, and token contrast gate passing 32/32 token pairs across light and dark themes.

---

## 2. Changes Summary (File List)

### New Files Created
1. `src/content/cardio-met-table.json`: Verbatim Compendium MET dataset (18 activity/level pairs, worked examples, formulas, caveats).
2. `src/modules/workout/cardioEngine.ts`: Core calculation module for Gross & Net energy expenditure and live timestamp deltas.
3. `src/modules/workout/cardioEngine.test.ts`: Unit tests verifying the 4 worked examples (to within 0.01 kcal), monotonicity, and fat-grams prevention.
4. `src/modules/workout/CardioRunner.tsx`: Fullscreen countdown, live runner timer, wake lock, IndexedDB persistence, and finish summary.
5. `src/modules/workout/cardioRunner.test.ts`: State machine tests for countdown, running, paused, finished, and reload restoration.
6. `src/modules/tracking/setPropagation.ts`: State transitions, forward-only propagation engine, and undo mechanism.
7. `src/modules/tracking/setPropagation.test.ts`: Unit tests and 500-operation randomized property test.
8. `src/modules/workout/videoUtils.ts`: Strict allowlist parser and normalizer for YouTube, Vimeo, and direct video files.
9. `src/modules/workout/videoUtils.test.ts`: 37 security and parsing test cases (rejecting malicious protocols, host lookalikes, malformed IDs).
10. `src/modules/workout/VideoPlayer.tsx`: Facade video player with strict sandbox, offline fallback, and 10s load fallback.
11. `src/modules/workout/VideoPlayer.test.tsx`: Component tests for facade interaction, offline messaging, and iframe mounting.
12. `src/utils/clipboard.ts`: 3-tier clipboard copy utility (`navigator.clipboard` -> `execCommand` -> textarea selection).
13. `src/modules/workout/CopyExerciseNameButton.tsx`: Exercise name copy button with Arabic/English choice popup and toast.
14. `src/modules/workout/NoImageExercisePlaceholder.tsx`: Dedicated media placeholder offering 3 prominent actions (انسخ الاسم، ضيف صورتك، ضيف فيديو).
15. `src/modules/workout/exerciseOverrides.ts`: Storage layer, `selectEffectiveExercise` selector, canvas resizer (640px), quota manager, and import validator.
16. `src/modules/workout/exerciseOverrides.test.ts`: Selector merge correctness, reset, quota enforcement, and import validation tests.
17. `src/modules/workout/ExerciseEditSheet.tsx`: Modal sheet for editing exercise names, images, instructions, muscles, notes, and video URL.
18. `scripts/capture-g5b-screenshots.mjs`: Automated evidence screenshot capture across 3 viewports, 2 themes, and 2 font scales.

### Existing Files Modified
1. `src/content/claims.ts`: Registered claims `cardio_met_caveat`, `cardio_gross_vs_net` (unverified), `sugg.first_time_weight`, `sugg.progress`, and `sugg.below_range`.
2. `src/ui/Choice.tsx`: Enhanced segmented variant to support optional `opt.icon`.
3. `src/modules/workout/WeeklyPlanView.tsx`: Integrated B1.2 cardio setup screen, duration stepper + direct input, live estimate, and runner launch.
4. `src/modules/tracking/SessionLogger.tsx`: Integrated cell states (`empty`, `suggested`, `auto`, `user`, `done`), propagation on change, undo toast, and suggestion hint claims.
5. `src/modules/tracking/ProgressScreen.tsx`: Added session history rendering for cardio sessions with proper Arabic plurals via `plural()`.
6. `src/modules/workout/ExerciseDetailView.tsx`: Integrated copy name button, overrides layer, «معدّل» badge, video player, and edit sheet trigger.
7. `src/modules/workout/ExerciseLibraryModal.tsx`: Integrated `selectEffectiveExercise` selector and «معدّل» badge on exercise tiles.
8. `src/modules/shared/types.ts`: Added `CardioSessionDetails`, `TrackingSession.cardioDetails`, and updated `CardioConfig.effort`.
9. `src/modules/tracking/trackingStore.ts`: Exported singleton `trackingStore`.
10. `src/modules/backup/backupStore.ts`: Integrated `exerciseOverrides` into backup payload export and validated import.
11. `src/qa/states.ts`: Registered all B1-B4 states in `SHEET_STATES` and `CHOICE_OPTION_STATES`.
12. `index.html`: Updated CSP meta tag to allow `frame-src https://www.youtube-nocookie.com https://player.vimeo.com` and `media-src 'self' https: data: blob:`.
13. `public/sw.js`: Added cache bypass for video files and streams.
14. `docs/STATE.md`: Appended G5-B status table, MET verification table, engine audit, and assumptions.

---

## 3. Verification & Automated Gates Results

### A. Full Test Suite (`npm test`)
- **Status**: PASSED (100% green)
- **Files**: 40 passed (40)
- **Tests**: 275 passed (275)
- **Key Suites**:
  - `cardioEngine.test.ts`: 4 worked examples in `cardio-met-table.json` reproduced within 0.01 kcal; monotonic tests pass; no fat-grams string output.
  - `cardioRunner.test.ts`: Countdown cancel, early finish, timestamp calculation, IndexedDB persistence, reload restoration pass.
  - `setPropagation.test.ts`: Table transitions pass; 500-operation random property test confirms `user` and `done` cells never mutate by propagation; undo restores initial states.
  - `videoUtils.test.ts`: 37 hostile/valid URL cases pass (protocol injection, malformed IDs, domain spoofing rejected).
  - `VideoPlayer.test.tsx`: Facade card, zero initial iframes, offline awareness, and 10s fallback pass.
  - `exerciseOverrides.test.ts`: Selective override merge, canvas quota enforcement, and import schema validation pass.
  - `statesRegistry.test.ts`: All registered routes, sheets, and choice options validated.

### B. Clipping & Occlusion Gate (`scripts/gate-clipping.mjs`)
- **Status**: PASSED
- **Total states evaluated**: 132
- **Total elements examined**: 4,524
- **Violations**: 0
- **Viewports tested**: 360x720, 360x640, 412x892
- **Themes tested**: Light, Dark
- **Font scales**: 1.0, 1.3

### C. WCAG AA Contrast Gate (`scripts/gate-contrast.mjs` & `scripts/check-token-contrast.mjs`)
- **Status**: PASSED
- **Token pairs evaluated**: 32 (16 in Light, 16 in Dark)
- **Compliance**: 100% $\ge 4.5:1$ (lowest ratio 4.79:1 for Success on Success-BG in Light; all text tokens $> 5:1$).
- **Interactive controls tested in DOM**: 208 across routes and themes (0 violations).

### D. Source Code Clipping Annotations Gate (`scripts/gate-clip-sources.mjs`)
- **Status**: PASSED
- **Declarations examined**: 79
- **Declarations with explicit `clip-ok` reason**: 79
- **Violations**: 0

### E. Evidence Screenshots
Captured on production build served locally under `evidence/g5-b/screenshots/` across 360x720, 360x640, 412x892 at 1.0 and 1.3 font scales in light and dark themes:
- `*_b1_cardio_setup.png`: Cardio day setup with activity Choice, effort cards, duration stepper, and live Gross/Net estimate.
- `*_b1_cardio_info_sheet.png`: Gross vs. Net educational info sheet.
- `*_b1_cardio_runner.png`: Live cardio runner with timer, progress ring, and live calories.
- `*_b2_session_logger.png`: Set logger with auto-propagated cells (dashed borders) and suggestion hints.
- `*_b3_b4_exercise_detail.png`: Exercise detail page with video player facade, copy name button, and «معدّل» badge.
- `*_b4_copy_menu.png`: Copy exercise name Arabic/English popup menu.
- `*_b4_edit_sheet.png`: Exercise edit sheet with custom instructions, targeting, and media options.

---

## 4. Production Bundle Size Delta

| Metric | Task G5-A Baseline | Task G5-B (Current) | Delta | Budget / Target |
| :--- | :---: | :---: | :---: | :---: |
| **JS Bundle** | 1,621.25 kB | 1,699.69 kB | +78.44 kB (+4.8%) | Within budget |
| **JS (gzipped)** | 321.50 kB | 333.86 kB | +12.36 kB (+3.8%) | Within budget |
| **CSS Bundle** | 98.12 kB | 99.66 kB | +1.54 kB (+1.5%) | Within budget |
| **CSS (gzipped)** | 17.43 kB | 17.63 kB | +0.20 kB (+1.1%) | Within budget |
| **HTML** | 1.34 kB | 1.34 kB | 0 kB | Within budget |
| **New Dependencies** | 0 | 0 | 0 (Strict R8) | 0 new packages |

---

## 5. Compendium MET Re-Verification Summary
All 18 code/MET pairs in `src/content/cardio-met-table.json` were cross-referenced against the published 2011 Compendium of Physical Activities PDF (Ainsworth et al.):
1. **Run**: 12029 (6.0), 12030 (8.3), 12050 (9.8) — all confirmed.
2. **Walk**: 17200 (4.3), 17210 (5.3), 17211 (8.0) — all confirmed.
3. **Bike**: 02017 (4.8), 02012 (6.8), 02013 (8.8) — all confirmed.
4. **Swim**: 18240 (5.8), 18290 (8.3), 18230 (9.8) — all confirmed.
5. **Jumprope**: 15552 (8.8), 15551 (11.8), 15550 (12.3) — all confirmed.
6. **Rowing**: 02071 (4.8), 02072 (7.0), 02073 (8.5) — all confirmed.

---

## 6. Calculation Engine Cardio Energy Consumption
- In `src/modules/nutrition/nutritionEngine.ts` (`calculateEAT`), workout energy is already calculated using **NET** expenditure:
  $$\text{kcal/min} = (\text{MET} - 1) \times 3.5 \times \frac{\text{weightKg}}{200}$$
- This avoids double counting resting energy (which BMR already accounts for).
- No calculation formulas in `nutritionEngine.ts` were modified (Rule R4).

---

## 7. Assumptions & Design Decisions
1. **Progression Weight Rounding**: Weight progression (+5% for 2 consecutive top-of-range sessions) is rounded to the nearest **0.5 kg** (`Math.round(w * 2) / 2`), matching standard Olympic plate increments.
2. **First-Time Rep Suggestion**: For an exercise without prior history, pre-fills the lower-to-mid part of the program's rep range (the lower bound if the span is $\ge 3$ reps, e.g. 8 for 8-12 reps).
3. **Cardio Gross vs. Net Copy**: Claim `cardio_gross_vs_net` is registered as `unverified` pending verified Egyptian coach copy from the owner; production hides the body text and cleanly shows the UI labels "الإجمالي" and "الزيادة بسبب التمرين".
4. **User Image Constraints**: Max dimension 640px long edge via HTML5 Canvas (which strips EXIF metadata), stored as a blob/data URI in IndexedDB, with a hard quota of 10 custom exercise images or 5 MB storage.

---

## 8. Open Questions for the Owner
1. **Cardio Info Sheet Egyptian Copy**: When your coach provides the exact two-sentence explanation for the difference between Gross and Net energy, we can update `cardio_gross_vs_net` in `claims.ts` to `coach_authored` or `sourced` to surface the explanatory body text.
2. **Progression Rounding Increments**: Does the owner use standard 0.5 kg micro-plates or dumbbell jumps (typically 1 kg or 2 kg)? The current 0.5 kg step is flexible, but can be tailored per equipment type if desired.
3. **Default Video Allowlist**: Currently YouTube, Vimeo, and direct files (.mp4/.webm/.m4v) are supported for in-app embedding, while other platforms (Instagram, TikTok) show an external browser launcher. Would you like support for any additional platforms?

---

## 9. "Was False" List
- **Pre-existing assumption**: "Cardio day runner was already implemented and wired to the database."
  *Reality*: While a basic timer view existed in earlier tasks, it lacked Compendium MET calculations, Gross/Net breakdown, clock-based delta counters, wake lock integration, IndexedDB reload recovery, and session logging with Arabic plurals. All of these have now been implemented and tested.
- **Pre-existing assumption**: "Cell states and auto-propagation were partially functioning in `SessionLogger`."
  *Reality*: Set fields previously lacked distinct state tracking (`empty`, `suggested`, `auto`, `user`, `done`), visual differentiation, and undo support. The full state machine with property tests and undo toast is now implemented.
