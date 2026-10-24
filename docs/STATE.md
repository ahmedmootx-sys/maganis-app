# Task G5-A State Registry

| Item ID | Description | Status | Evidence Paths | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **A0** | Bootstrap (OPERATING-RULES.md, STATE.md, prod build & SW baseline, checks) | done | [OPERATING-RULES.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/OPERATING-RULES.md), [STATE.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/STATE.md) | Baseline commit `fd34578`, dist: JS 1621.25 kB, CSS 98.12 kB |
| **A1** | Day-count contradiction between Home and Training (root fix) | done | [a1-property-test-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/a1-property-test-red.txt), [a1-property-test-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/a1-property-test-green.txt), [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/screenshots) | Single selector `weekLoadSelector.ts`, shared `ScheduleMismatchCallout.tsx`, 1000 random operations tested with 0 violations |
| **A2** | Overlap, cut-off and hidden mid-screen edges (root fix) | done | [gate-clip-sources-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/gate-clip-sources-red.txt), [gate-clip-sources-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-clip-sources-green.txt), [gate-clipping-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/gate-clipping-red.txt), [gate-clipping-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-clipping-green.txt) | Layering contract in `tokens.css`, `--page-end` inset, history tab max-content fix, 132 states & 4,416 elements verified with 0 violations |
| **A3** | Contrast and legibility, light and dark (root fix) | done | [gate-token-contrast-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/gate-token-contrast-red.txt), [gate-token-contrast-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-token-contrast-green.txt), [gate-contrast-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-contrast-green.txt) | 32 token pairs verified (100% >= 4.5:1), 208 interactive controls evaluated across routes & themes |
| **A4** | «صمم لي جدولي» button in Settings does nothing (fix) and the template | done | [aiPromptPrivacy.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/aiPromptPrivacy.test.ts), [aiDesignerAndImporter.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/aiDesignerAndImporter.test.ts) | Root cause: modal was unmounted outside `case 'workouts'`. Moved to global root. Updated to v2 prompt template with Phase 5 ongoing coaching. Privacy gate and importer round-trip pass. |
| **A5** | Fix what was seen on the screenshots even if not listed elsewhere | done | [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/screenshots) | Fixed exercise detail GIF & history tab drift, cardio runner toast contrast, and set logger scroller docking |
| **A6.B1** | Carry-over B1: library header, filters, segmented control, tile icons | done | [ExerciseLibraryModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseLibraryModal.tsx), [library_chest_filter_open_light_360x720.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/screenshots/library_filter_open_light_360x720.png) | 44x44 icon button for «إضافة تمرين», equal Choice tabs, hidden empty archived tab, fixed filter height |
| **A6.B2** | Carry-over B2: empty Training state (clipped button, missing manual action) | done | [WeeklyPlanView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/WeeklyPlanView.tsx), [training_empty_light_360x720.png](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/screenshots/training_empty_light_360x720.png) | Centered empty state, ordered 4 actions, primary accent button |
| **A6.B3** | Carry-over B3: Home no-program state & protein engine check | done | [Dashboard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/dashboard/Dashboard.tsx) | Home shows «ابدأ برنامجك» with 4 actions, neutral dash for unassigned days. Protein engine audited: 1.8 g/kg BW (80kg -> 144g) |
| **A6.B4** | Carry-over B4: calculation-guide rewrite through `<Claim>` | done | [MacroGuideModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/MacroGuideModal.tsx), [claims.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/content/claims.ts) | Guide rendered through `<Claim>` backed by `claims.ts` with interpolated engine constants |
| **A6.B5** | Carry-over B5: cardio icons and unsourced claims | done | [WeeklyPlanView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/WeeklyPlanView.tsx) | Distinct activity icons, unsourced text hidden as `unverified` claims, tokenized colors |
| **A6.B6** | Carry-over B6: day-row badges and titles | done | [WeeklyPlanView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/WeeklyPlanView.tsx), [sessionResolver.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/sessionResolver.ts) | Removed generic «يوم تدريبي», title format `weekday · focus`, nowrap badges with flex-shrink: 0 |
| **A6.B7** | Carry-over B7: «إدارة البرنامج» menu | done | [WeeklyPlanView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/WeeklyPlanView.tsx) | Grouped under «البرنامج», «البيانات», and separated danger item «حذف الجدول الحالي» |
| **A6.B8** | Carry-over B8: vault (plurals, createdAt timestamp, placeholder, sheet footers) | done | [ProgramVaultModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ProgramVaultModal.tsx), [ownerProgramImporter.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ownerProgramImporter.ts) | Arabic plurals via `plural()`, `createdAt: Date.now()`, clean placeholder `اسم الجدول` |
| **A6.B9** | Carry-over B9: «تعديل الجدول» routing to «تعديل أيام الجدول» | done | [ScheduleMismatchCallout.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ScheduleMismatchCallout.tsx) | Direct route to `DaysAdjustSheet` via `onOpenDaysAdjust` |
| **A6.B10**| Carry-over B10: custom exercise form (defaults, measurement, textareas, media) | done | [CustomExerciseBuilder.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/CustomExerciseBuilder.tsx), [ExerciseDetailView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseDetailView.tsx) | Removed silent defaults (start empty with «اختر»), 2 measurement options (reps / duration), min 4-row textareas with plural counts, renamed sections, https & 3MB media validation with CORS warning, atlas preview, and cancel confirmation |
| **A6.B11**| Carry-over B11: onboarding injuries step (yes/no choice, referral callout, flow) | done | [OnboardingWizard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/onboarding/OnboardingWizard.tsx), [LimitationsEditor.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/LimitationsEditor.tsx) | Choice segmented control, Appendix B1 calm referral callout, non-blocking progression |
| **A6.B12**| Carry-over B12: verification additions & coverage | done | [gate-clipping.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-clipping.mjs), [states.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/qa/states.ts) | All required states registered, gate-clipping checks 4,416 elements with 0 errors |

---

# Task G5-B State Registry (Features)

| Item ID | Description | Status | Evidence Paths | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **B1.1** | Cardio Data & Formulas (Compendium MET, Gross/Net, worked examples) | done | [cardioEngine.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/cardioEngine.ts), [cardioEngine.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/cardioEngine.test.ts) | 4 worked examples in JSON reproduced within 0.01 kcal; monotonic tests pass; zero mentions of fat grams; claims registered. |
| **B1.2** | Cardio Setup UI (Choice 6 activities, 3 effort levels with hints, duration stepper, live estimate, weight prompt) | done | [WeeklyPlanView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/WeeklyPlanView.tsx), [Choice.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/ui/Choice.tsx), [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-b/screenshots) | Live estimate card with Gross headline & Net subline; info sheet with `cardio_gross_vs_net`; disabled start button with clear Arabic reason when input missing. |
| **B1.3** | Cardio Runner (3-2-1 countdown, clock-derived live timer, wake lock, IndexedDB persistence, summary & history) | done | [CardioRunner.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/CardioRunner.tsx), [cardioRunner.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/cardioRunner.test.ts), [ProgressScreen.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/tracking/ProgressScreen.tsx) | Timestamps (`Date.now()`) delta calculation (never `setInterval` tick count); Wake Lock API with fallback message; IndexedDB persistence across reload; Arabic plurals via `plural()`. |
| **B2.1** | Set Auto-Propagation (empty/suggested/auto/user/done states, forward-only propagation, toast + undo) | done | [setPropagation.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/tracking/setPropagation.ts), [setPropagation.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/tracking/setPropagation.test.ts), [SessionLogger.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/tracking/SessionLogger.tsx) | Table-driven transition tests pass; 500-op randomized property test confirms `user` and `done` never mutate by propagation; dashed border styling; undo toast restores prior states. |
| **B2.2** | Scientific Suggestions (rep ranges, last session prefill, +5% progression rounded to 0.5kg, below-range hint) | done | [claims.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/content/claims.ts), [SessionLogger.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/tracking/SessionLogger.tsx) | Helms et al. 2016 (`sugg.first_time_weight`), ACSM 2009 (`sugg.progress`), coach-authored (`sugg.below_range`); zero absolute starting weights suggested. |
| **B3** | Explanation Video Link (strict HTTPS parser, facade player, CSP, SW bypass, offline notice) | done | [videoUtils.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/videoUtils.ts), [VideoPlayer.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/VideoPlayer.tsx), [videoUtils.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/videoUtils.test.ts), [VideoPlayer.test.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/VideoPlayer.test.tsx) | 37 hostile/valid URL test cases; 0 iframes in DOM until play tapped; strict sandbox; SW bypass for video; 10s load fallback link. |
| **B4.1** | Copy Exercise Name (Arabic / English popup menu, clipboard fallbacks, no-image placeholder actions) | done | [CopyExerciseNameButton.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/CopyExerciseNameButton.tsx), [NoImageExercisePlaceholder.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/NoImageExercisePlaceholder.tsx), [clipboard.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/clipboard.ts) | 3-tier clipboard helper (`navigator.clipboard` -> `execCommand` -> textarea selection); 3 actions on no-image placeholder (انسخ الاسم، ضيف صورتك، ضيف فيديو). |
| **B4.2** | Overrides Layer (`exerciseOverrides`, selector, canvas resize, quota, badge, edit sheet, backup round-trip) | done | [exerciseOverrides.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/exerciseOverrides.ts), [ExerciseEditSheet.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseEditSheet.tsx), [exerciseOverrides.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/exerciseOverrides.test.ts) | `selectEffectiveExercise` selector; canvas resizer (max 640px, EXIF stripped); 10 images / 5MB quota; «معدّل» badge; catalog never mutated; full backup export & validated import. |
| **B5** | Automated Verification & Gates (States registry, clipping & contrast gates, full test suite) | done | [states.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/qa/states.ts), [gate-clipping.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-clipping.mjs), [gate-contrast.mjs](file:///c:/Users/power%20tech/Downloads/maganis-project/scripts/gate-contrast.mjs), [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-b/screenshots) | 132 states & 4,524 elements verified with 0 clipping/occlusion violations; 32 token pairs (100% WCAG AA) & 208 controls checked; 40/40 test files (275/275 tests) pass. |

---

## Compendium MET Re-Verification (Ainsworth et al., 2011)
Source: *Ainsworth BE, Haskell WL, Herrmann SD, et al. 2011 Compendium of Physical Activities: a second update of codes and MET values. Med Sci Sports Exerc. 2011;43(8):1575-1581.*

| Activity | Level | Code | MET in File | Verified in Compendium PDF | Compendium Description |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Outdoor Run** | Light | 12029 | 6.0 | ✅ Confirmed (6.0) | Jogging, about 4 mph (6.4 km/h) |
| **Outdoor Run** | Moderate | 12030 | 8.3 | ✅ Confirmed (8.3) | Running, about 5 mph (8 km/h) |
| **Outdoor Run** | High | 12050 | 9.8 | ✅ Confirmed (9.8) | Running, about 6 mph (9.7 km/h) |
| **Brisk / Incline Walk** | Light | 17200 | 4.3 | ✅ Confirmed (4.3) | Walking, level, brisk, firm surface, 3.5 mph (5.6 km/h) |
| **Brisk / Incline Walk** | Moderate | 17210 | 5.3 | ✅ Confirmed (5.3) | Walking, uphill, 1 to 5% grade |
| **Brisk / Incline Walk** | High | 17211 | 8.0 | ✅ Confirmed (8.0) | Walking, uphill, 6 to 15% grade |
| **Stationary Bike** | Light | 02017 | 4.8 | ✅ Confirmed (4.8) | Stationary cycling, 51-89 W, light effort |
| **Stationary Bike** | Moderate | 02012 | 6.8 | ✅ Confirmed (6.8) | Stationary cycling, 90-100 W, moderate effort |
| **Stationary Bike** | High | 02013 | 8.8 | ✅ Confirmed (8.8) | Stationary cycling, 101-160 W, vigorous effort |
| **Freestyle Swimming**| Light | 18240 | 5.8 | ✅ Confirmed (5.8) | Swimming, freestyle, light or moderate effort |
| **Freestyle Swimming**| Moderate | 18290 | 8.3 | ✅ Confirmed (8.3) | Swimming, freestyle, 50 yd/min (46 m/min), mod/vig |
| **Freestyle Swimming**| High | 18230 | 9.8 | ✅ Confirmed (9.8) | Swimming, freestyle, vigorous effort |
| **Jump Rope** | Light | 15552 | 8.8 | ✅ Confirmed (8.8) | Rope jumping, slow, < 100 skips/min |
| **Jump Rope** | Moderate | 15551 | 11.8 | ✅ Confirmed (11.8) | Rope jumping, moderate, 100-120 skips/min |
| **Jump Rope** | High | 15550 | 12.3 | ✅ Confirmed (12.3) | Rope jumping, fast, 120-160 skips/min |
| **Rowing Machine** | Light | 02071 | 4.8 | ✅ Confirmed (4.8) | Rowing, stationary ergometer, light effort |
| **Rowing Machine** | Moderate | 02072 | 7.0 | ✅ Confirmed (7.0) | Rowing, stationary ergometer, about 100 W |
| **Rowing Machine** | High | 02073 | 8.5 | ✅ Confirmed (8.5) | Rowing, stationary ergometer, about 150 W |

*Conclusion*: All 18 code/MET pairs in `src/content/cardio-met-table.json` match the 2011 Compendium publication exactly.

---

## Energy Calculation Engine Consumption Audit
- **Formula audit**: `src/modules/nutrition/nutritionEngine.ts` (`calculateEAT`) computes cardio energy expenditure using **NET** MET:
  $$\text{kcal/min} = (\text{MET} - 1) \times 3.5 \times \frac{\text{weightKg}}{200}$$
- **Rationale**: Utilizing NET expenditure avoids double counting resting metabolic rate, since Basal Metabolic Rate (BMR) already accounts for 24-hour resting expenditure.
- **Engine integrity**: No changes were made to calculation engine formulas (strict adherence to Rule R4).

---

## Assumptions & Design Choices
1. **Progression Weight Rounding**: Weight progression (+5% for 2 consecutive top-of-range sessions) is rounded to the nearest **0.5 kg** (`Math.round(w * 2) / 2`). This reflects standard Olympic micro-plates (0.25kg on each side).
2. **First-Time Rep Suggestion**: For an exercise without history, pre-fills the lower-to-mid part of the program's rep range (the lower bound if the span is $\ge 3$ reps, e.g. 8 for 8-12 reps).
3. **Cardio Info Sheet**: Registered as `unverified` under `cardio_gross_vs_net` until verified coach Egyptian copy is provided by the owner; UI labels ("الإجمالي" and "الزيادة بسبب التمرين") remain fully displayed in production.
4. **User Image Constraints**: Max dimension 640px long edge via HTML5 Canvas (which strips EXIF metadata), stored locally as data URI/blob, capped at 10 custom exercise images or 5 MB storage quota.

---

# Task G5-C State Registry (Atlas Redesign & Egyptian Copy)

| Item ID | Description | Status | Evidence Paths | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **C1.1** | Atlas Depth & Contrast Redesign (separation strokes, depth gradient, hit targets) | done | [tokens.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/tokens.css), [components.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/components.css), [gate-atlas-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/green/gate-atlas-green.txt), [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/atlas) | 1px non-scaling separation strokes (`--atlas-line`), static linear depth gradients (`#grad-muscle-depth`), 7 small muscles expanded to $\ge 24\times 24$ CSS px hit targets. |
| **C1.2** | Atlas Interactivity & Detail (leaderline labels, tap selection, non-occlusion viewBox shift, zoom/pan, grouped chips) | done | [AnatomyMuscleMap.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/AnatomyMuscleMap.tsx), [atlasLabels.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/atlasLabels.ts), [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/atlas) | "الأسماء" toggle with 17 anterior & 17 posterior collision-free labels; 2.5px accent outline on selected muscle; dynamic viewBox shift prevents sheet occlusion; pinch & double-tap zoom (1x-3x); searchable grouped chips with fallback for `no_mesh`. |
| **C1.3** | Deep Muscle Mode (translucent silhouette, surface ghosting, exercise involvement, layer pointer-events) | done | [gate-atlas-deep-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/green/gate-atlas-deep-green.txt), [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/atlas) | Translucent silhouette (`--atlas-silhouette-fill`), surface ghosting (15-25% opacity), deep full/60%, shading layers suppressed, single view-state object `{ view, layer, selectedMuscleId, exerciseContext }`. |
| **C1.4** | 3D Spike: BodyParts3D / Three.js Evaluation | done | [atlas-3d.md](file:///c:/Users/power%20tech/Downloads/maganis-project/docs/spikes/atlas-3d.md) | Evaluated Three.js, Babylon.js, Model-Viewer. Decision: No 3D viewer shipped. Zero new dependencies. 2D SVG atlas retained for performance and bundle budget. |
| **C2.1** | Exercise Catalog Consolidation (`1.1.0-batch1`, 44 exercises, Egyptian copy) | done | [catalog-v1.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/data/catalog-v1.json), [catalogConsolidation.test.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/catalogConsolidation.test.ts) | Exactly 44 coach-authored exercises imported in pure Egyptian Arabic (`ar-EG`); R11-compliant names; 279 vitest suite tests pass. |
| **C2.2** | Muscle Actions Claims Registration & Verification | done | [muscle-info-v1.json](file:///c:/Users/power%20tech/Downloads/maganis-project/src/content/muscle-info-v1.json), [claims.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/content/claims.ts), [content-inventory.json](file:///c:/Users/power%20tech/Downloads/maganis-project/reports/content-inventory.json) | 53 muscle actions registered as `coach_authored` claims under `muscle_does.<id>`; 71 total claims inventoried; rendered via `<Claim>`. |
| **C2.3** | Egyptian Arabic UI Microcopy Rewriting | done | [g5-c-copy-changes.md](file:///c:/Users/power%20tech/Downloads/maganis-project/reports/g5-c-copy-changes.md), [gate-formal-markers-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/green/gate-formal-markers-green.txt), [gate-banned-patterns-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/green/gate-banned-patterns-green.txt) | 50 UI strings rewritten to natural Cairo Egyptian dialect; formal markers (ينبغي، يتوجب، يجب أن، قم بـ، حيث إن، يمكنك، الرجاء) eliminated across all screens; 0 gate violations across 4,995 strings. |
| **C3** | QA States & Automated Verification Gates | done | [states.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/qa/states.ts), [Screenshots](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-c/atlas) | 12 new atlas states registered; 24 evidence screenshots captured; all 4 automated gates green. |

---

## Atlas Root Cause Analysis

### 1. Flat Look Root Causes
1. **Zero Separation Strokes**: Individual muscle SVG paths had no strokes (`stroke: none`). When adjacent muscles were highlighted with the same primary/secondary fill, their outlines merged into an undifferentiated solid red/yellow blob.
2. **Flat Fills Without Depth**: Paths used uniform single-color fills (`#E53935` / `#FDD835`). Real human anatomy has curvature and volume.
3. **Missing Architectural Stroke Contract**: No design tokens existed for atlas vector borders that remain hairline-thin under zoom.

*Remediation*:
- Added `vector-effect="non-scaling-stroke"` and `stroke: var(--atlas-line)` (semi-transparent stroke with theme-tailored contrast) around every muscle head path.
- Added static linear gradients (`#grad-muscle-depth`) incorporating subtle highlights (`--atlas-muscle-highlight`) and shadows (`--atlas-muscle-shadow`).

### 2. Deep Mode Black Silhouette Root Causes
1. **Opaque Solid Silhouette**: The base silhouette path had an opaque dark fill (`#1a1a1a` in dark theme, `#e0e0e0` in light theme).
2. **Complete Surface Muscle Occlusion / Elimination**: In deep mode, surface muscles were either hidden or rendered with solid colors, leaving the body looking like an impenetrable black mannequin cutout.
3. **Shade Layer Misalignment**: Shading layers designed for surface musculature created dark muddy patches over deep anatomical paths.

*Remediation*:
- Silhouette changed to translucent fill (`--atlas-silhouette-fill: rgba(0,0,0,0.02)` in light, `rgba(255,255,255,0.03)` in dark) and crisp perimeter stroke (`--atlas-silhouette-stroke: rgba(0,0,0,0.12)` in light, `rgba(255,255,255,0.22)` in dark).
- Surface muscles rendered as subtle ghosts (15-25% opacity) in deep mode so anatomical spatial landmarks (clavicle, ribs, spine) remain visible.
- Shading layer suppressed in deep mode (`.atlas-deep-mode .atlas-shade-layer { display: none !important; }`).

---

## Atlas Asset Metrics

| Asset | Pre-G5C Size | Post-G5C Size | Growth | Budget Status |
| :--- | :---: | :---: | :---: | :---: |
| `public/atlas/anterior.svg` | 310.9 KB | 329.8 KB | +18.9 KB (+6.0%) | ✅ Within budget |
| `public/atlas/posterior.svg` | 280.4 KB | 298.8 KB | +18.4 KB (+6.5%) | ✅ Within budget |
| `dist/assets/index-*.css` | 98.1 KB | 102.3 KB | +4.2 KB | ✅ Within budget |
| `dist/assets/index-*.js` | 1,621.2 KB | 1,711.8 KB (337.0 KB gzip) | +90.6 KB | ✅ Within budget |

---

## Muscle Breakdown & Layer Classification (53 Total)

- **Layer Breakdown**: 35 Surface Muscles (S), 18 Deep Muscles (D).
- **Mesh Representation**:
  - `mesh`: 46 muscles (accurate 3D-derived BodyParts3D 4.0 vectors).
  - `derived_approx`: 2 muscles (`pec_sternal`, `pec_costal` — 65/35 geometric split labeled as approximate).
  - `no_mesh`: 5 muscles (`rectus_abdominis_upper`, `rectus_abdominis_lower`, `transversus_abdominis`, `iliopsoas`, `quadratus_lumborum` — clear text fallback: "مفيش رسم للعضلة دي").

| Muscle ID | Layer | Type | Gym Name (Primary) | Scientific Name (Secondary) | Group |
| :--- | :---: | :---: | :--- | :--- | :--- |
| `pec_clavicular` | S | mesh | صدر علوي | Pectoralis major — clavicular head | chest |
| `pec_sternal` | S | derived_approx | صدر أوسط | Pectoralis major — sternal head | chest |
| `pec_costal` | S | derived_approx | صدر سفلي | Pectoralis major — costal head | chest |
| `pec_minor` | D | mesh | الصدرية الصغرى | Pectoralis minor | chest |
| `serratus_anterior` | D | mesh | سيراتس | Serratus anterior | serratus |
| `delt_anterior` | S | mesh | كتف أمامي | Anterior deltoid | shoulders |
| `delt_lateral` | S | mesh | كتف جانبي | Lateral deltoid | shoulders |
| `delt_posterior` | S | mesh | كتف خلفي | Posterior deltoid | shoulders |
| `teres_minor` | D | mesh | تيرس مينور | Teres minor | rotator_cuff |
| `infraspinatus` | S | mesh | إنفراسبيناتس | Infraspinatus | rotator_cuff |
| `supraspinatus` | D | mesh | سوبراسبيناتس | Supraspinatus | rotator_cuff |
| `trap_upper` | S | mesh | ترابس علوي | Upper trapezius | traps |
| `levator_scapulae` | D | mesh | رافعة الكتف | Levator scapulae | traps |
| `trap_middle` | S | mesh | ترابس أوسط | Middle trapezius | upper_back |
| `trap_lower` | S | mesh | ترابس سفلي | Lower trapezius | upper_back |
| `rhomboids` | D | mesh | رومبويد | Rhomboids (major & minor) | upper_back |
| `teres_major` | S | mesh | تيرس ميجر | Teres major | upper_back |
| `lats` | D | mesh | لاتس | Latissimus dorsi | lats |
| `erector_spinae` | S | mesh | عضلات أسفل الضهر | Erector spinae | lower_back |
| `quadratus_lumborum`| D | no_mesh | مربعة قطنية | Quadratus lumborum | lower_back |
| `biceps_long` | S | mesh | باي – الرأس الطويل | Biceps brachii — long head | biceps |
| `biceps_short` | S | mesh | باي – الرأس القصير | Biceps brachii — short head | biceps |
| `brachialis` | D | mesh | براكيالس | Brachialis | biceps |
| `triceps_long` | S | mesh | تراي – الرأس الطويل | Triceps brachii — long head | triceps |
| `triceps_lateral` | S | mesh | تراي – الرأس الخارجي | Triceps brachii — lateral head | triceps |
| `triceps_medial` | D | mesh | تراي – الرأس الأوسط | Triceps brachii — medial head | triceps |
| `brachioradialis` | S | mesh | براكيورادياليس | Brachioradialis | forearms |
| `forearm_flexors` | S | mesh | ساعد داخلي | Forearm flexors | forearms |
| `forearm_extensors` | S | mesh | ساعد خارجي | Forearm extensors | forearms |
| `rectus_abdominis_upper` | D | no_mesh | بطن علوي | Rectus abdominis — upper | abs |
| `rectus_abdominis_lower` | D | no_mesh | بطن سفلي | Rectus abdominis — lower | abs |
| `obliques_external` | S | mesh | أوبليك | External obliques | abs |
| `transversus_abdominis` | D | no_mesh | بطن عميقة | Transversus abdominis | abs |
| `iliopsoas` | D | no_mesh | إليوبسواس | Iliopsoas | hip |
| `tfl` | S | mesh | جانب الورك الأمامي | Tensor fasciae latae | hip |
| `sartorius` | S | mesh | الخياطية | Sartorius | hip |
| `rectus_femoris` | S | mesh | فخذ أمامي – منتصف | Rectus femoris | quads |
| `vastus_lateralis` | S | mesh | فخذ أمامي – خارجي | Vastus lateralis | quads |
| `vastus_medialis` | S | mesh | فخذ أمامي – داخلي | Vastus medialis | quads |
| `vastus_intermedius`| D | mesh | فخذ أمامي – عميق | Vastus intermedius | quads |
| `hamstring_bf_long` | S | mesh | فخذ خلفي – خارجي طويل | Biceps femoris — long head | hamstrings |
| `hamstring_bf_short`| D | mesh | فخذ خلفي – خارجي قصير | Biceps femoris — short head | hamstrings |
| `hamstring_semitendinosus` | S | mesh | فخذ خلفي – داخلي سطحي | Semitendinosus | hamstrings |
| `hamstring_semimembranosus` | S | mesh | فخذ خلفي – داخلي عميق | Semimembranosus | hamstrings |
| `glute_max` | S | mesh | جلوتس كبير | Gluteus maximus | glutes |
| `glute_med` | S | mesh | جلوتس أوسط | Gluteus medius | glutes |
| `glute_min` | D | mesh | جلوتس أصغر | Gluteus minimus | glutes |
| `adductors` | S | mesh | فخذ داخلي | Hip adductors | adductors |
| `tibialis_anterior`| S | mesh | الساق الأمامية | Tibialis anterior | lower_leg |
| `gastrocnemius_medial` | S | mesh | سمانة داخلية | Gastrocnemius — medial head | lower_leg |
| `gastrocnemius_lateral` | S | mesh | سمانة خارجية | Gastrocnemius — lateral head | lower_leg |
| `soleus` | D | mesh | سمانة عميقة | Soleus | lower_leg |
| `neck_scm` | S | mesh | عضلة الرقبة | Sternocleidomastoid | neck |
