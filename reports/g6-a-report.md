# MAGANIS TASK G6-A: VERIFICATION & DEFECT AUDIT REPORT

**Verification Method**: Verified in emulation (Chromium DPR 2, viewports: 360x720, 360x640, 412x892; light & dark themes; font scales 1.0 & 1.3) via automated Playwright drivers and pixel-sampled inspection against the production build served through the service worker.
**Status**: COMPLETE (9/9 Defects Resolved; 4/4 Generic Gates Passing; 41/41 Vitest Suites Passing)

---

## 1. Executive Summary & Defect Table

| Defect ID | Title | Red Screenshot (Pre-Fix) | Green Screenshot (Post-Fix) | Gate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **D1** | Library Header: Overlap & 2nd row dropdown cut | `evidence/g6-a/red/d1-library-overlap.png` | `evidence/g6-a/green/d1-library-overlap.png` | `gate-overlap` | **FIXED** |
| **D2** | Sets: Forward Propagation of weight, reps & time | `evidence/g6-a/red/d2-set-propagation.png` | `evidence/g6-a/green/d2-set-propagation.png` | `gate-raw-tokens`, vitest | **FIXED** |
| **D3** | Exercise Video: Facade disappearance & Reset action | `evidence/g6-a/red/d3-video-play.png` | `evidence/g6-a/green/d3-video-play.png` | Route stub, vitest | **FIXED** |
| **D4** | Raw Internal Identifiers on screen | `evidence/g6-a/red/d4-raw-tokens.png` | `evidence/g6-a/green/d4-raw-tokens.png` | `gate-raw-tokens` | **FIXED** |
| **D5** | Cardio Runner: Layout gutters, buttons & spelling | `evidence/g6-a/red/d5-cardio-runner.png` | `evidence/g6-a/green/d5-cardio-runner.png` | `gate-overlap`, `gate-clipping` | **FIXED** |
| **D6** | Exercise Edit Sheet: UX, unnested muscle picker | `evidence/g6-a/red/d6-edit-sheet.png` | `evidence/g6-a/green/d6-edit-sheet.png` | `gate-overlap`, `gate-raw-tokens` | **FIXED** |
| **D7** | Contrast & Legibility: Pixel-sampled WCAG AA | `evidence/g6-a/red/d7-contrast.png` | `evidence/g6-a/green/d7-contrast.png` | `gate-contrast` (pixel) | **FIXED** |
| **D8** | Training List: Truncated day titles | `evidence/g6-a/red/d8-training-day-titles.png` | `evidence/g6-a/green/d8-training-day-titles.png` | `gate-clipping` | **FIXED** |
| **D9** | Exercise Page Header & bottom navigation padding | `evidence/g6-a/red/d9-exercise-page-header.png` | `evidence/g6-a/green/d9-exercise-page-header.png` | `gate-overlap`, `gate-clipping` | **FIXED** |

---

## 2. Gate Results & Diagnostics

All gates were executed against the production build served via Vite preview (`http://localhost:5200+`):

### 1. `gate-overlap` (P6 Generic Gate)
- **Pre-Fix**: FAILED (Red) on old library header where search count ("تم العثور على 44 تمرين") was absolutely positioned over the dropdowns and list cards started underneath dropdowns.
- **Post-Fix**: **PASSED (0 violations)** across 3,610 elements and 31,793 element pairs tested across 96 viewport/theme/font-scale configurations.
- **Why previous gates stayed green**: Earlier gates did not test dynamic overlay groupings, and only sampled static mock routes that omitted the 44-card library search view with multi-row dropdowns.

### 2. `gate-raw-tokens` (P7 Generic Gate)
- **Pre-Fix**: FAILED with 26 violations (including `"none"`, `"body only"`, `"pec_sternal"`, `"trap_lower"`, `"pull-up"` identifier leak, unescaped Latin citation titles, and unescaped attributions).
- **Post-Fix**: **PASSED (0 violations)** across 772 visible text nodes examined. Every internal identifier is translated into Egyptian gym terminology via `src/utils/labels.ts`, and intentional English titles/citations are strictly wrapped inside `<bdi dir="ltr">`.
- **Minimum Enforced**: >= 20 text nodes per state (15 for minimal stopwatch cardio runner).

### 3. `gate-contrast` (Pixel-Sampled WCAG AA Gate)
- **Pre-Fix**: FAILED with 17 contrast violations (faded rest timer label "فترة الراحة" with 2.88:1, checkmark buttons with 2.54:1, add set buttons with 2.88:1, active session banner tags with 3.01:1, dark mode toast with 1.11:1).
- **Post-Fix**: **PASSED (0 violations)** across 290 pixel-sampled text nodes. Every node meets or exceeds WCAG AA (>= 4.5:1 normal text, >= 3:1 for large text and icons).
- **Evidence Table**: Stored in `evidence/g6-a/contrast.md`.

### 4. `gate-clipping` (Pixel-Level Clipping & Occlusion Gate)
- **Post-Fix**: **PASSED (0 violations)** across 132 states and 4,776 elements evaluated.

---

## 3. Detailed Root Causes & Fix Descriptions

### D1. Library Header Overlap & Filter Sheet
- **What was seen**: "تم العثور على 44 تمرين" was printed on top of the "المعدات: الكل" dropdown; the first exercise card started over the second row of dropdowns.
- **Root Fix**: Rebuilt `ExerciseLibraryModal.tsx` into a strict normal-flow flex layout without fixed container heights or absolute positioning. Search input sits at top, followed by a compact filter bar containing a single "فلاتر" button with active badge count and horizontal active filter chips. The four dropdowns were moved into an accessible slide-up bottom `Sheet` following the shared modal contract (sticky footer with "تطبيق" and "مسح"). The result count sits cleanly above the list, with proper gap at font scale 1.3.
- **"التفصيل" Filter Finding**: Investigation revealed that "التفصيل" filters exercises by sub-muscle / muscle head (`targetSubMuscleAr`), e.g., "صدر علوي", "صدر أوسط", "بايسبس الرأس الطويل". It has been clearly labeled in the filter sheet as "الاستهداف التفصيلي (الرأس العضلي)".

### D2. Set Propagation & Cell State Machine
- **What was seen**: Ticking set 1 left sets 2 and 3 empty with grey placeholder, causing "اكتب الوزن والتكرارات أولًا" validation error on ticking set 2. Card header showed "8 x 3 ·" in inverted bidi order.
- **Root Fix**:
  - Implemented cell states: `empty`, `suggested`, `auto`, `user`, `done`.
  - On input into set $i$, value is forward-propagated to subsequent sets $j > i$ whose cells are `empty`, `suggested`, or `auto` as `auto` (rendered with dashed border and high-contrast styling, distinct from placeholders).
  - Validation error only triggers if a cell is truly empty and does not shift row layout.
  - Added undo toast ("اتنقلت لباقي المجموعات" with "تراجع") that reverts propagation.
  - Preserved prescription bidi order using `<bdi dir="ltr">{formatPrescription(pe)}</bdi>` rendering "3 × 8".

### D3. Video Player Facade & Override Reset
- **What was seen**: Tapping play on YouTube Shorts link caused the entire card to disappear.
- **Root Cause**: `paddingBottom: '56.25%'` flex container collapsed inside `display: flex` parent to 2px height, and `overflow: hidden` clipped the iframe. Additionally, YouTube requires `strict-origin-when-cross-origin` referrer policy to avoid player configuration errors.
- **Root Fix**:
  - Replaced flex padding hack with modern CSS `aspectRatio: '16 / 9'`.
  - Added loading spinner while iframe mounts and loads.
  - Added 10s timeout, CSP violation listener, and error fallback displaying: "الفيديو مش بيشتغل جوه التطبيق دلوقتي" with an inline "افتح في يوتيوب ↗" link.
  - Wrapped player in `VideoErrorBoundary`.
  - Added "إعادة الضبط" action in sheet header and exercise page overflow menu (visible only when exercise has overrides), showing confirmation dialog and 8-second undo toast ("رجّعنا التمرين زي ما كان").

### D4. Canonical Labels (`src/utils/labels.ts`)
- **What was seen**: Chips showing `"none"`, `"body only"`, `"pec_sternal"`, `"trap_lower"`.
- **Root Fix**: Created centralized `src/utils/labels.ts` mapping all catalog enums, equipment keys, difficulty levels, kinds, and muscle IDs to Egyptian gym slang (e.g. "وزن الجسم", "بار", "دامبل", "عضلة الصدر", "ترابيس") with scientific English names wrapped in `<bdi dir="ltr">`.

### D5. Cardio Runner Layout
- **What was seen**: Cards and buttons touching screen edges, "إنهاء الجلسة" rendered as unstyled red text, inconsistent spelling ("جرى" vs "جري"), and non-pluralized "4 سعرة".
- **Root Fix**: Added standard page gutters (`--inset-inline: 16px`), paired Pause and End buttons into two equal-width styled controls in a single row, normalized all occurrences to "جري", and used `plural(kcal, 'سعرة')` producing "4 سعرات".

### D6. Exercise Edit Sheet UX
- **What was seen**: Textareas cramped with internal scrolling, muscle targeting nested in tiny scrolling box cycling through states, bracketed labels `[رئيسية]`, and counter reading "500 / 0".
- **Root Fix**:
  - Auto-growing textareas (`minRows={4}`, max 40vh, `textAlign: start`).
  - Unnested muscle picker grouped by anatomical region directly in sheet scroll. Each chip shows gym name + scientific name in `<bdi>`; tapping opens an explicit 3-way segmented control ("أساسية / مساعدة / مش مستهدفة").
  - Role tokens for primary (red) and secondary (yellow) passing AA contrast without brackets.
  - Character counter formatted as `<bdi dir="ltr">{count} / 500</bdi>`.
  - 44x44px chevron buttons for step reordering.
  - Dirty-state guard (`ConfirmSheet`) on close with unsaved changes.

### D7. Contrast & Legibility
- **What was seen**: "فترة الراحة" label nearly invisible; placeholders failing contrast; dark mode toasts illegible.
- **Root Fix**: Updated `--color-placeholder` tokens to `#52525b` (light) and `#a1a1aa` (dark); set rest timer label to `var(--color-text, #111)` (18.11:1); adjusted dark theme success/accent tokens to pass WCAG AA (>= 4.5:1).

### D8. Training List Day Titles
- **What was seen**: Day titles truncated with ellipsis ("السبت · علوي (أ) — ...").
- **Root Fix**: Removed single-line truncate restriction, allowing titles under 60 characters to wrap across up to 2 lines (`line-clamp: 2`), keeping badge, menu button, and chevrons vertically aligned.

### D9. Exercise Page Header & Page Scaffold
- **What was seen**: Top bar was an empty white band with back arrow; video card at bottom was clipped by navigation.
- **Root Fix**: Placed exercise title inside `TopBar` (as `<span>` while page title remains single `<h1>`), and added bottom content padding `calc(var(--bottom-nav-height, 64px) + var(--bottom-inset) + 32px)`.

---

## 4. Bundle Size Impact

- **Baseline Commit**: `bb5ff2d`
  - JavaScript: `1,722.20 kB` (gzip: `341.57 kB`)
  - CSS: `102.39 kB` (gzip: `18.02 kB`)
- **Current Production Build**:
  - JavaScript: `1,732.07 kB` (gzip: `341.95 kB`) $\rightarrow$ **$\Delta$: +9.87 kB** (+0.38 kB gzip)
  - CSS: `102.80 kB` (gzip: `18.04 kB`) $\rightarrow$ **$\Delta$: +0.41 kB** (+0.02 kB gzip)
- **Dependencies**: 0 new dependencies added.

---

## 5. Changed Files Table

| File | Changes Made |
| :--- | :--- |
| `src/utils/labels.ts` | **NEW**: Canonical translation module for all enums, equipment, muscles, and bdi formatting. |
| `src/modules/workout/ExerciseLibraryModal.tsx` | Normal-flow layout, compact filter bar with Sheet, `formatBdiText` integration. |
| `src/modules/workout/ActiveWorkoutSession.tsx` | Forward propagation state machine, auto cell styles, undo toast, bidi prescription. |
| `src/modules/workout/VideoPlayer.tsx` | `aspectRatio: 16/9`, loading spinner, 10s timeout, error boundary, YouTube referrer policy. |
| `src/modules/workout/ExerciseEditSheet.tsx` | Auto-growing textareas, unnested group muscle picker, 3-option segmented control, 44px step buttons. |
| `src/modules/workout/ExerciseDetailView.tsx` | TopBar title, single `<h1>`, reset override actions, safe bottom scroll padding. |
| `src/modules/workout/WeeklyPlanView.tsx` | 2-line day title wrapping, `<bdi dir="ltr">` wrap on `WORKOUT_SPLIT_EN`. |
| `src/modules/workout/CardioRunner.tsx` | Layout gutters, dual equal-width action buttons, normalized "جري", calorie plurals. |
| `src/components/ExerciseMediaCard.tsx` | Wrapped attribution text in `<bdi dir="ltr">`. |
| `src/modules/settings/SettingsScreen.tsx` | Wrapped third-party attributions in `<bdi dir="ltr">`. |
| `src/content/Claim.tsx` | Wrapped scientific citation sources in `<bdi dir="ltr">`. |
| `src/styles/tokens.css` | High-contrast placeholder tokens, AA-verified dark mode semantic tokens. |
| `src/styles/components.css` | AA-compliant `.button-success` and `.set-check-btn.checked` styles. |
| `src/ui/ListRow.tsx` | Overlay layer grouping attribute. |
| `src/ui/Sheet.tsx` | Overlay layer grouping attribute for backdrop/modal. |
| `src/ui/BottomNav.tsx` | Overlay layer grouping attribute. |
| `src/ui/TopBar.tsx` | Heading level flexibility. |
| `src/ui/Toast.tsx` | AA-compliant toast text and action styling. |
| `src/App.tsx` | Overlay grouping attributes, active session banner contrast fix. |
| `scripts/gate-overlap.mjs` | **NEW**: Generic gate enforcing zero illegal element overlaps across 96 device configs. |
| `scripts/gate-raw-tokens.mjs` | **NEW**: Generic gate checking for leaked enum tokens, snake_case, and untagged Latin text. |
| `scripts/gate-contrast.mjs` | **NEW**: Pixel-sampled WCAG AA contrast gate for light and dark themes. |
| `scripts/reproduce-g6a.mjs` | **NEW**: Automated reproduction script capturing red screenshots for D1-D9. |
| `scripts/capture-g6a-green.mjs` | **NEW**: Verification script capturing green screenshots for D1-D9. |
| `qa/drive.ts` | **NEW**: Playwright state driver opening exact reproducible states. |
| `docs/OPERATING-RULES.md` | Added process rules P1-P10. |
| `docs/STATE.md` | Updated feature and defect tracking state. |

---

## 6. "Was False" List (Prior Inaccurate Reports)

1. **"Library layout fixed and responsive"**: Was false. Dropdowns took two full rows, the search count was positioned on top of the equipment dropdown, and the first card overlapped the second dropdown row.
2. **"Set propagation works on check"**: Was false. Weight was left empty with placeholder text and ticking set 2 threw validation errors instead of auto-filling.
3. **"Video embeds functional"**: Was false. Flex container padding bug collapsed the iframe height to 2px, making the card disappear completely on tapping play.
4. **"All internal tokens localized"**: Was false. Raw keys `"none"`, `"body only"`, `"pec_sternal"`, and `"trap_lower"` were exposed directly in user-facing chips.
5. **"Cardio runner screen finalized"**: Was false. Buttons and cards touched viewport edges, End button was unstyled red text, and spelling had inconsistent "جرى" vs "جري".
6. **"Contrast passes WCAG AA"**: Was false. "فترة الراحة" was set to a low-opacity color failing 3:1, checkmark buttons had 2.54:1 contrast, and toasts were illegible in dark mode.

---

## 7. Questions for the Owner

1. **Filter "التفصيل"**: We confirmed it filters by muscle sub-head (`targetSubMuscleAr`), e.g., "صدر علوي" or "بايسبس الرأس الطويل". We labeled it "الاستهداف التفصيلي (الرأس العضلي)". Do you prefer keeping this in the filter sheet or combining it with the primary muscle selector?
2. **Undo Toast Timeout**: The propagation undo toast stays for 5 seconds. Does that give you enough time on mobile to tap "تراجع" if you didn't want the weight carried over?
3. **Cardio Runner Audio Cue**: The countdown now counts 3-2-1 visually before starting the timer. Would you like an optional short audio beep on real devices when the countdown ends?
