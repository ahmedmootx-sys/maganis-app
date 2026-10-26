# MAGANIS TASK G5-A REPORT

**Date**: 2026-10-24  
**Baseline Commit**: `fd34578`  
**Bundle Size (Baseline)**: JS: `1,621.25 kB` (gzip: `315.80 kB`), CSS: `98.12 kB` (gzip: `17.48 kB`)  
**Bundle Size (Post-Fix)**: JS: `1,630.78 kB` (gzip: `317.20 kB`), CSS: `99.66 kB` (gzip: `17.63 kB`)  
**Bundle Size Delta**: JS: `+9.53 kB` (+0.58%), CSS: `+1.54 kB` (+1.57%). Total within strict bundle budget.  
**Tested Viewports (R7)**: `360x720`, `360x640`, `412x892` at DPR 2, Themes: `light` & `dark`, Font scales: `1.0` & `1.3`.  
**All Verification Evidence**: Stored under [evidence/g5-a/](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/)

---

## 1. What Changed (File List)

### Core Logic & State Management

1. [src/modules/workout/weekLoadSelector.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/weekLoadSelector.ts) (New)
   - Created the single source of truth selector `selectWeekLoad` and helper `getDayCardio`.
   - Strictly enforces semantics: `profile.trainingDaysPerWeek` counts resistance days ONLY. Cardio days are additional scheduled sessions.
   - Computes: `resistanceDays`, `cardioDays`, `mobilityDays`, `restDays`, and `totalScheduledSessions`.
2. [src/modules/workout/ScheduleMismatchCallout.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ScheduleMismatchCallout.tsx) (New)
   - Unified callout component shared between Home and Training screens.
   - Compares `weekLoad.resistanceDays` solely against `profile.trainingDaysPerWeek`. Never mentions cardio as the cause of mismatch.
   - Single action sets `profile.trainingDaysPerWeek = weekLoad.resistanceDays`, clearing the callout on both screens simultaneously without modifying `day.kind`.
3. [src/modules/dashboard/Dashboard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/dashboard/Dashboard.tsx)
   - Refactored to read solely from `selectWeekLoad`.
   - Updated sessions tile count line to show full scheduled sessions breakdown with exact Arabic plural formatting (e.g. «5 مقاومة + 1 كارديو»).
   - Replaced custom mismatch callout with `ScheduleMismatchCallout`.
   - In no-program state, displays «ابدأ برنامجك» with the four ordered actions (same as Training empty state).
   - Week strip shows neutral dash for unassigned days; rest moon appears only for days explicitly assigned «راحة».
4. [src/modules/workout/WeeklyPlanView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/WeeklyPlanView.tsx)
   - Refactored schedule mismatch callout to use `ScheduleMismatchCallout`.
   - Centered empty Training state vertically with four ordered action buttons using primary accent styling: «إنشاء برنامج تدريبي», «صمم لي جدولي الخاص», «استيراد جدول», «بناء جدول يدوي».
   - Reorganized «إدارة البرنامج» menu into three logical groups: «البرنامج», «البيانات», and separated danger item «حذف الجدول الحالي».
   - Updated day row titles to `weekday · focus` or custom name, removing repetitive generic «يوم تدريبي».
   - Prevented «اليوم» badge from wrapping (`white-space: nowrap; flex: none;`).
   - Tokenized `CardioDayScreen`: replaced raw hex colors with design tokens, hid unsourced claims as `unverified` claims in `claims.ts`.
5. [src/modules/workout/sessionResolver.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/sessionResolver.ts)
   - Updated `cleanDayName` to strip generic fallback «يوم تدريبي» and return informative day focus titles.

### Styling & Design System Foundations

6. [src/styles/tokens.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/tokens.css)
   - Implemented unified layering contract: `--z-content: 1`, `--z-sticky: 100`, `--z-nav: 200`, `--z-sheet: 400`, `--z-toast: 500`, `--z-dialog: 600`.
   - Introduced dynamic `--bottom-inset` and `--page-end: calc(var(--bottom-nav-height, 64px) + var(--bottom-inset) + 16px)`.
   - WCAG AA contrast adjustments for dark theme: danger token upgraded to `#f87171` (5.84:1 ratio) and info token upgraded to `#60a5fa` (5.78:1 ratio).
7. [src/styles/components.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/components.css) & [src/styles/app.css](file:///c:/Users/power%20tech/Downloads/maganis-project/src/styles/app.css)
   - Replaced fixed bottom paddings with `--page-end` to guarantee clearance above fixed navigation.
   - Annotated all legitimate clipping declarations with `/* clip-ok: <reason> */`.
8. [src/components/DateField.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/components/DateField.tsx)
   - Styled hidden native date input with zero-dimension visually-hidden clip to eliminate container overflows.

### AI Designer & Importer Fixes (A4)

9. [src/App.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/App.tsx)
   - **Root Cause Fix**: Mounted `AiDesignerModal` at the root application shell. Previously it was only mounted inside `case 'workouts'`, causing taps from Settings or other screens to do nothing.
10. [src/modules/workout/AiDesignerModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/AiDesignerModal.tsx)
    - Replaced raw native `<select>` tags with design system `<Select>` component.
    - Added data preview with toggle «ضمّن بياناتي من التطبيق» (default on).
    - Integrated clipboard copying with fallback and toast feedback.
    - Updated copy button to «انسخ البرومبت» and share button to «شارك» (when `navigator.share` exists).
11. [src/modules/workout/aiPromptBuilder.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/aiPromptBuilder.ts)
    - Updated prompt generation to use the complete `ai-designer-prompt-template-v2.md` including Phase 5 ongoing coaching.
    - Strictly sanitized prompt output to exclude owner profile names and body numbers.
12. [src/modules/workout/importSchema.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/importSchema.ts)
    - Anonymized default synthetic example title to `"برنامج القوة"` to prevent owner name leakage.

### Carry-Over Audits (A6 / B1–B12)

13. [src/modules/workout/ExerciseLibraryModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseLibraryModal.tsx)
    - «إضافة تمرين» header button made 44x44 icon button with `aria-label`.
    - Segmented control «الكل | المحذوفة» uses equal Choice tiles and hides «المحذوفة» when count is 0.
    - Fixed filter row container height to prevent vertical clipping.
    - Updated title to «مكتبة التمارين» with plural helper.
14. [src/modules/nutrition/MacroGuideModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/nutrition/MacroGuideModal.tsx)
    - Completely rewritten to render through `<Claim>` backed by `claims.ts`.
    - All guide numbers interpolated dynamically from calculation engine constants and user profile.
15. [src/modules/workout/ProgramVaultModal.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ProgramVaultModal.tsx)
    - Fixed Arabic plural agreement: `plural(count, 'جدول')`.
    - Input placeholder updated to clean `«اسم الجدول»` with helper text below.
16. [src/modules/workout/ownerProgramImporter.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ownerProgramImporter.ts)
    - Fixed hardcoded timestamp `1760778000000` (which was 2025-10-18) to use `Date.now()`.
17. [src/modules/workout/CustomExerciseBuilder.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/CustomExerciseBuilder.tsx)
    - Removed silent defaults: category, level, equipment, and primary muscles start empty with «اختر».
    - Reduced measurement options to two equal tiles: «تكرارات» and «وقت».
    - Textareas auto-grow with minimum 4 rows and full placeholder wrapping.
    - Steps and mistakes display live item counts via `plural()`.
    - Renamed sections to «الفوائد» and «التقنية والأداء».
    - Enforced `https://` validation, 3 MB file size limit, and Arabic CORS explanation.
    - Integrated `AnatomyMuscleMap` preview with red primary and yellow secondary chips.
    - Added cancel confirmation sheet when changes are unsaved.
18. [src/modules/workout/ExerciseDetailView.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/ExerciseDetailView.tsx)
    - Added «أضفته أنت» badge in the meta chips row for custom exercises.
    - Fixed history tab pill drift by sizing tab container to content (`width: max-content; min-width: 100%`).
19. [src/modules/onboarding/OnboardingWizard.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/onboarding/OnboardingWizard.tsx) & [src/modules/workout/LimitationsEditor.tsx](file:///c:/Users/power%20tech/Downloads/maganis-project/src/modules/workout/LimitationsEditor.tsx)
    - Updated red-flag question to exact coach-supplied wording: «هل عندك تنميل أو ضعف مفاجئ أو ألم شديد بعد إصابة قوية؟».
    - Segmented Choice control with equal «لا» / «نعم» tiles.
    - When «نعم» is chosen: displays calm referral callout from Appendix B1, records `redFlag: true`, and allows the user to proceed.
    - Verified that selecting «لا» for injuries enables «التالي» immediately without requiring injury selection.
20. [src/utils/plural.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/utils/plural.ts)
    - Added full 6-category plural definitions for `'resistance'` («مقاومة»), `'cardio'` («كارديو»), `'step'` («خطوة»), and `'mistake'` («خطأ»).
21. [src/qa/states.ts](file:///c:/Users/power%20tech/Downloads/maganis-project/src/qa/states.ts)
    - Registered all new G5-A screens, sheets, dialogs, and states.

---

## 2. Gate Verification (Red-First vs. Green)

In accordance with Operating Rule R5, every gate was demonstrated failing on the pre-fix build (red), then passing on the fixed build (green). All outputs are archived in `evidence/g5-a/`.

### Gate 1: A1 Property Test (`test-a1-property.mjs`)

- **Red Failure** ([evidence/g5-a/red/a1-property-test-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/a1-property-test-red.txt)):
  ```
  ❌ Violations detected: 1272
  Failures:
    - Operation 1: Home count (5) != Training count (4). Home counted cardio day as resistance day.
    - Operation 4: Schedule mismatch callout appeared on Home but not Training.
    - Operation 7: Callout action flipped day.kind from cardio to strength.
  ```
- **Green Pass** ([evidence/g5-a/green/a1-property-test-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/a1-property-test-green.txt)):
  ```
  📊 Total operations tested: 1000 (500 on Owner Dump, 500 on Fixture)
  📊 Violations detected: 0
  ✅ A1 Property Test PASSED cleanly across all operations and datasets!
  ```

### Gate 2: Token Contrast Gate (`check-token-contrast.mjs`)

- **Red Failure** ([evidence/g5-a/red/gate-token-contrast-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/gate-token-contrast-red.txt)):
  ```
  --- Theme: DARK ---
  | Danger Text on Danger BG | #ef4444 | #450a0a | 4.29:1 | 4.5:1 | ❌ FAIL |
  | Info Text on Info BG | #3b82f6 | #172554 | 4.00:1 | 4.5:1 | ❌ FAIL |
  Total token pairs evaluated: 32. Failures: 2.
  ```
- **Green Pass** ([evidence/g5-a/green/gate-token-contrast-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-token-contrast-green.txt)):
  ```
  --- Theme: LIGHT --- (16 pairs tested, all >= 4.5:1)
  --- Theme: DARK ---
  | Danger Text on Danger BG | #f87171 | #450a0a | 5.84:1 | 4.5:1 | ✅ PASS |
  | Info Text on Info BG | #60a5fa | #172554 | 5.78:1 | 4.5:1 | ✅ PASS |
  Total token pairs evaluated: 32. Failures: 0. 100% WCAG AA compliant.
  ```

### Gate 3: Rendered Interactive Contrast Gate (`gate-contrast.mjs`)

- **Green Pass** ([evidence/g5-a/green/gate-contrast-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-contrast-green.txt)):
  ```
  Checked 208 interactive controls across routes (#/home, #/training, #/nutrition, #/progress, #/settings) and themes (light, dark).
  ✓ gate-contrast passed cleanly! All controls pass WCAG AA contrast >= 4.5:1.
  ```

### Gate 4: Clipping Sources Declaration Gate (`gate-clip-sources.mjs`)

- **Red Failure** ([evidence/g5-a/red/gate-clip-sources-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/gate-clip-sources-red.txt)):
  ```
  📊 Declarations examined: 151
  📊 Declarations with explicit clip-ok reason: 0
  📊 Unannotated clipping declarations (violations): 151
  ❌ Gate FAILED: found 151 unapproved clipping sources.
  ```
- **Green Pass** ([evidence/g5-a/green/gate-clip-sources-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-clip-sources-green.txt)):
  ```
  📊 Declarations examined: 76
  📊 Declarations with explicit clip-ok reason: 76
  📊 Unannotated clipping declarations (violations): 0
  ✅ Gate PASSED: All clipping sources properly documented with clip-ok reason.
  ```

### Gate 5: Pixel-Level Clipping & Occlusion Gate (`gate-clipping.mjs`)

- **Red Failure** ([evidence/g5-a/red/gate-clipping-red.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/red/gate-clipping-red.txt)):
  ```
  ❌ Found 26 clipping/occlusion violations across 360x640:
    - input.date-field__native-input scrollWidth (15px) > clientWidth (14px)
    - Bottom button elementFromPoint failed (occluded by fixed bottom navigation bar)
  ```
- **Green Pass** ([evidence/g5-a/green/gate-clipping-green.txt](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/green/gate-clipping-green.txt)):
  ```
  📊 Total states evaluated: 132
  📊 Total elements examined: 4,416
  📊 Total clipping violations: 0
  ✅ gate-clipping PASSED: 0 clipped or occluded elements across all registered states!
  ```

### Gate 6: Vitest & TypeScript Suite

- `npm run typecheck`: **0 errors**.
- `npm test`: **34 test files passed, 202 tests passed, 0 failures**. Includes:
  - `aiPromptPrivacy.test.ts`: Asserts zero owner data leaks.
  - `aiDesignerAndImporter.test.ts`: Prompt example validates against importer schema with zero warnings.
  - `weekLoadProperty.test.ts`: Asserts state stability under random schedules.

---

## 3. Screenshots (A1 Configurations & Registry States)

All screenshots were captured on the production bundle served through Chromium emulation at DPR 2 and stored under [evidence/g5-a/screenshots/](file:///c:/Users/power%20tech/Downloads/maganis-project/evidence/g5-a/screenshots/):

### A1 Schedule Configurations (Home & Training)

1. **5 Resistance + 1 Cardio**:
   - Light: `a1_5res_1cardio_home_light_360x720.png`, `a1_5res_1cardio_training_light_360x720.png`
   - Dark: `a1_5res_1cardio_home_dark_360x720.png`, `a1_5res_1cardio_training_dark_360x720.png`
2. **5 Resistance Only**:
   - Light: `a1_5res_only_home_light_360x720.png`, `a1_5res_only_training_light_360x720.png`
   - Dark: `a1_5res_only_home_dark_360x720.png`, `a1_5res_only_training_dark_360x720.png`
3. **6 Resistance Only**:
   - Light: `a1_6res_only_home_light_360x720.png`, `a1_6res_only_training_light_360x720.png`
   - Dark: `a1_6res_only_home_dark_360x720.png`, `a1_6res_only_training_dark_360x720.png`
4. **4 Resistance + 1 Cardio**:
   - Light: `a1_4res_1cardio_home_light_360x720.png`, `a1_4res_1cardio_training_light_360x720.png`
   - Dark: `a1_4res_1cardio_home_dark_360x720.png`, `a1_4res_1cardio_training_dark_360x720.png`

### Core Registered States & Font Scale 1.3

- Viewports: `360x720`, `360x640`, `412x892` in `light` and `dark` themes.
- Captured states include: `library_filter_open`, `library_muscle_selected`, `exercise_detail`, `exercise_history_tab`, `session_logger`, `cardio_runner_toast`, `training_empty`, and `settings`.
- Font scale 1.3: `home_fontscale1.3_light/dark`, `training_fontscale1.3_light/dark`, `library_fontscale1.3_light/dark`, `exercise_fontscale1.3_light/dark`.

---

## 4. Specific Reports Required by Prompt

### B3d: Protein Engine Audit (Report Only — No Formula Edits per R4)

- **Engine Rule**:
  - Basis: Total body weight (`weightKg`), NOT lean body mass.
  - Factor: `1.8 g/kg` body weight for hypertrophy / muscle building goal.
  - Scientific basis cited in engine: _Morton et al. 2018 (British Journal of Sports Medicine)_: breakpoint of muscle protein synthesis plateaus at ~1.62 g/kg, up to 2.2 g/kg with confidence intervals.
- **Values for Owner Profile Dump (`docs/owner-profile-dump.json`)**:
  - Weight: `80 kg`
  - Goal: Hypertrophy (`gain`)
  - Target Protein: `80 kg × 1.8 g/kg = 144 g/day` (576 kcal).
  - Target Calories: 2,326 kcal (Fat: 65 g = 25% kcal, Carbs: 292 g = remainder).
- **Trial Profile (60 kg)**:
  - If a 60 kg weight is entered with a 2.0 g/kg manual goal, target is 120 g. The coach can align with the owner whether to default to 1.8 g/kg or 2.0 g/kg for custom goals.

### B8b: CreatedAt Migration Audit

- The timestamp `1760778000000` (which pointed to 2025-10-18) shipped in `ownerProgramImporter.ts` was replaced with dynamic `Date.now()`.
- Importer code was verified to ignore any `createdAt` in imported program files and always set `createdAt = Date.now()`.
- Migration ran on local storage and imported drafts: 1 program was migrated from the 2025 fixed date to the current date.

### B11: Onboarding Red-Flag Question Behavior

- On the current build, when the user selects «نعم» for the red-flag symptom question:
  - It displays the calm, non-alarmist referral callout from Appendix B1:
    > «إذا كان عندك تنميل أو ضعف مفاجئ أو ألم شديد بعد إصابة قوية، استشر طبيبًا قبل أي تمرين. يمكنك المتابعة، لكن لا تبدأ أي تمرين يحمّل هذه المنطقة قبل الفحص.»
  - Sets `profile.medical.redFlag = true`.
  - Does NOT block the user from proceeding; «التالي» remains clickable.
  - Flow check: If the user answers «لا» to having injuries in Step 3, the limitations sub-editor is not required and «التالي» is immediately enabled.

### A4: Root Cause of «صمم لي جدولي» Button Inactivity

- **Root Cause**: `AiDesignerModal` was conditionally rendered inside `case 'workouts':` in `src/App.tsx`. When tapped from the Settings screen or any other view, the handler updated the state `isAiDesignerOpen = true`, but because the active route was not `workouts`, the component was never mounted into the DOM.
- **Resolution**: Moved `<AiDesignerModal>` to the global root modal layer alongside other global sheets in `App.tsx`.

---

## 5. Items Not Done & Why

- **None**. All requirements across A0, A1, A2, A3, A4, A5, and A6 (B1 through B12) have been implemented, tested, and verified.

---

## 6. "Was False" List (R9 Honest Reporting)

1. **"G4b was already applied to the repo"**:
   - _Was false_. Examination revealed that multiple G4b items were missing or incomplete: `AiDesignerModal` failed silently from Settings; `CustomExerciseBuilder` had silent pre-filled defaults (chest, beginner, bodyweight, pec); measurement type had 3 options instead of 2; `ownerProgramImporter` had a fixed 2025 date; dark theme danger/info colors failed WCAG AA; and Home counted cardio days toward resistance days. All have now been properly fixed and verified.
2. **"Home and Training agree on 5 resistance + 1 cardio"**:
   - _Was false_. Home previously counted all active scheduled days (including cardio) toward `trainingDaysPerWeek`, while Training counted only resistance days. This caused the app to flip between 5 and 6 days. Now fixed via `weekLoadSelector.ts` and `ScheduleMismatchCallout.tsx`.
3. **"Native date input overflow is caused by layout container clipping"**:
   - _Was false_. In `DateField.tsx`, the native invisible `<input type="date">` had subpixel rendering overflows on narrow 360x640 mobile viewports, triggering clipping gate alerts. Fixed with a zero-dimension visually-hidden clip pattern.

---

## 7. Questions for the Owner

1. **Default Protein Factor for Hypertrophy**: The calculation engine currently defaults to `1.8 g/kg` total body weight based on _Morton et al. 2018_. The trial screenshot showed 120 g for 60 kg (2.0 g/kg). Would you prefer the default factor for the hypertrophy goal to remain 1.8 g/kg, or be adjusted to 2.0 g/kg? (Formula remained untouched per R4).
2. **Program Lock Subtitle**: The «قفل الجدول» action in the program management menu now includes a clear subtitle explaining that it prevents accidental modifications to exercise order and set structure. Would you like locked programs to also prevent custom exercise additions, or allow additions while preserving existing sets?
