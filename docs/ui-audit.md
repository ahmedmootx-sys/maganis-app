# Maganis UI Audit Report (docs/ui-audit.md)

**Date:** 2026-10-15  
**Scope:** Pre-migration audit of Maganis frontend architecture, component consistency, styling metrics, form controls, bidi rules, and layout constraints at 360px mobile width.

---

## 1. Inventory of Screens, Routes, and Modals

### 1.1 Screens & Primary Views

Currently, the application manages navigation primarily through local tab state in `src/App.tsx`, with legacy sub-screens:

1. **Dashboard (`/home`, tab: `dashboard`):**
   - Active user profile summary, caloric balance ring, workout day teaser, streak counters, and recent activity feed.
2. **Workouts / Training (`/training`, tab: `workouts`):**
   - Weekly routine plan (`WeeklyPlanView.tsx`), daily exercise lists, workout day cards, muscle focus indicators, and custom schedule configuration.
3. **Nutrition (`/nutrition`, tab: `nutrition`):**
   - Daily macro tracker (`NutritionModule.tsx`), meal timeline, Egyptian meal library, manual food loggers, water intake tracker, and macro guides.
4. **Progress (`/progress`, tab: `progress`):**
   - Bodyweight progression tracker (`ProgressScreen.tsx`), body composition logs, measurement graphs, and personal best history.
5. **Settings (`/settings`, tab: `settings`):**
   - Profile editor, dark/light theme toggle, weekly start day preferences, units (kg/lbs), storage manager, backup export/import, and factory reset dialog.
6. **Reports (`/reports`, tab: `reports`):**
   - Historical workout and nutrition performance aggregates, SVG line charts, and backup operations.
7. **Onboarding Wizard (`OnboardingWizard.tsx`):**
   - Multi-step initial profile setup (name, gender, age, height, weight, activity level, fitness goals).
8. **Welcome Back Screen (`WelcomeBack.tsx`):**
   - Returning user greeting and quick resume prompt.

### 1.2 Modals, Overlays, and Sheets

The app includes 14 modal dialogs and overlays:

1. `ActiveWorkoutSession.tsx`: Full-screen active workout tracker with stopwatch, set logging tables, and completion celebration.
2. `ExerciseLibraryModal.tsx`: Searchable 800+ exercise directory with filters.
3. `ExercisePickerModal.tsx`: Modal for choosing exercises to append to a training day.
4. `ExerciseSwapModal.tsx`: Modal for swapping a specific exercise with targeted alternatives.
5. `ExerciseDetailModal.tsx` & `ExerciseDetailView.tsx`: Deep-dive sheet showing technique steps, anatomical muscle maps, and instructions.
6. `CustomExerciseBuilder.tsx`: Modal form for authoring user-defined exercises.
7. `CustomScheduleModal.tsx`: Modal for toggling weekly training days.
8. `ProgramVaultModal.tsx`: Modal for browsing, saving, and switching between pre-built or custom training programs.
9. `MuscleAtlasDebug.tsx`: Diagnostic inspector for anatomical muscle heads.
10. `CustomMealModal.tsx`: Nutrition modal for creating custom composite recipes.
11. `QuickManualMealModal.tsx`: Quick caloric/macro entry modal.
12. `MacroGuideModal.tsx`: Educational modal explaining protein, carb, and fat requirements.
13. `BackupPanel.tsx`: Data export/import sheet.
14. `ConfirmSheet.tsx`: Bottom sheet for destructive actions.

---

## 2. CSS Styling Metrics & Token Chaos

Analysis of `src/styles/app.css` (3,805 lines, 66.6 KB):

| Metric                    |      Measured Value      | Standard Target (Task A)                                                    |
| :------------------------ | :----------------------: | :-------------------------------------------------------------------------- |
| **Global CSS Files**      | 1 (`src/styles/app.css`) | `styles/tokens.css` + scoped component tokens                               |
| **Distinct Colours**      |         **124**          | **10** (bg, surface, surface-2, text, text-2, divider, accent, 4 semantics) |
| **Distinct Font Sizes**   |          **23**          | **6** (12, 14, 16, 18, 22, 28)                                              |
| **Distinct Border Radii** |          **11**          | **3** (12 for cards, 10 for controls, 999 for chips)                        |
| **Font Family**           |   Unstyled `system-ui`   | Single self-hosted font: **IBM Plex Sans Arabic** (woff2)                   |

### Key Issues Identified in Existing CSS:

- Raw hex codes scattered throughout components (`#0f172a`, `#64748b`, `#cbd5e1`, `#1e293b`, `#475569`, etc.) rather than semantic tokens.
- Brand orange inconsistencies: `#f95700` in light mode, `#ff6b1a` in dark mode, plus ad-hoc variations (`#ea580c`, `#f59e0b`, `#ff853f`).
- Random font sizes (`11px`, `13px`, `13.5px`, `15px`, `17px`, `20px`, `26px`, `32px`).
- Multiple border-radii (`3px`, `4px`, `6px`, `8px`, `10px`, `12px`, `14px`, `16px`, `20px`, `24px`, `9999px`).
- Hardcoded physical properties (`margin-left`, `padding-right`, `left: 0`) that break under RTL.

---

## 3. Emoji Audit

- **Total Emojis in `src/`:** **71 occurrences** (across 40 distinct glyphs).
- **Total Emojis in `data/`:** **0 occurrences**.
- **Unique Glyphs in Use:**
  `⚠ 📁 💪 ⏱ 📲 🏁 👈 📅 📄 👋 📈 📊 💾 📥 🗑 🥗 🌟 🔥 🥩 🍲 🏋 🧘 🏃 🍫 🦾 🎉 🧬 🔍 🎯 ⚡ 💡 ⚙ 🔬 📋 📚 ➕ ✨ 🔄 ✏ 🏠`

### Detailed Breakdown by File:

- `src/App.tsx`: 7 emojis (`⚠️`, `📁`, `💪`, `⏱️`, `📲`, `🏁`, `👈`).
- `src/components/DateField.tsx`: 1 emoji (`📅`).
- `src/components/FileField.tsx`: 2 emojis (`📁`, `📄`).
- `src/modules/onboarding/WelcomeBack.tsx`: 1 emoji (`👋`).
- `src/modules/reports/Reports.tsx`: 11 emojis (`⚠️`, `📈`, `📊`, `💾`, `📥`, `🗑️`, `🥗`, `🌟`, `🔥`, `🥩`, `🍲`).
- `src/modules/shared/types.ts`: 14 category emojis (`🔥`, `🏋️`, `🧘`, `🏃`, `🍫`, `🦾`).
- `src/modules/workout/ActiveWorkoutSession.tsx`: 2 emojis (`🎉`, `💾`).
- `src/modules/workout/AnatomyMuscleMap.tsx`: 5 emojis (`🧬`, `🔍`, `⚠️`, `🎯`, `⚡`).
- `src/modules/workout/CustomExerciseBuilder.tsx`: 2 emojis (`💡`).
- `src/modules/workout/CustomScheduleModal.tsx`: 1 emoji (`💡`).
- `src/modules/workout/ExerciseDetailModal.tsx`: 7 emojis (`🎯`, `⚙️`, `📊`, `🔬`, `📋`, `⚠️`, `📚`).
- `src/modules/workout/ExerciseDetailView.tsx`: 1 emoji (`⚠️`).
- `src/modules/workout/ExercisePickerModal.tsx`: 4 emojis (`➕`, `🔍`, `🎯`, `✨`).
- `src/modules/workout/ExerciseSwapModal.tsx`: 3 emojis (`🔄`, `🔍`, `🎯`).
- `src/modules/workout/MuscleAtlasDebug.tsx`: 1 emoji (`🔬`).
- `src/modules/workout/WeeklyPlanView.tsx`: 2 emojis (`✏️`, `🏠`).

**Action Required:** Replace all emojis with Lucide line icons, enforce `scripts/check-emoji` in build gates, and add runtime `stripEmoji()` for stored user data.

---

## 4. Native Form Elements and Window Dialogs

### 4.1 Native `<select>`

- **Total in DOM:** 0 raw unstyled native `<select>` tags in user-facing components (enforced by `DesignSystemGates.test.tsx`).
- **Occurrences:** All 39 instances are the custom React `<Select>` component trigger or test assertions.
- **Action Required:** Ensure `<Select>` conforms to the new UI sheet component specification with search and single/multi modes.

### 4.2 Native Date Inputs (`<input type="date">`)

- **Total:** 1 occurrence in `src/components/DateField.tsx:229` (retained as an accessible, hidden semantic input underneath the styled trigger).

### 4.3 Native File Inputs (`<input type="file">`)

- **Total:** 4 occurrences:
  - `src/components/FileField.tsx:122` (hidden semantic input).
  - `src/modules/backup/BackupPanel.tsx:252` (raw unstyled file input).
  - `src/modules/reports/Reports.tsx:468` (raw unstyled file input).
  - `src/modules/workout/WeeklyPlanView.tsx:1306` (raw unstyled file input).
- **Action Required:** Replace raw file inputs with the unified `FileField` component.

### 4.4 Window Dialogs (`window.alert`, `window.confirm`, `window.prompt`)

- **`window.alert` (8 occurrences):**
  - `CustomMealModal.tsx:149`, `177`, `189`
  - `Reports.tsx:99`, `116`, `139`, `169`
  - `ProgressScreen.tsx:299`
- **`window.confirm` (5 occurrences):**
  - `App.tsx:292`, `318`, `841`
  - `NutritionModule.tsx:448`
  - `Reports.tsx:147`
- **`window.prompt` (0 occurrences).**
- **Action Required:** Replace all alerts with `Toast` notifications, and all confirms with `ConfirmSheet`.

---

## 5. Mobile Layout & Bidi Fragility at 360px Width

Testing at `360px` mobile viewport width revealed the following layout and clipping defects:

1. **Shrink-wrapped buttons clipping Arabic text:**
   - Action buttons with `white-space: nowrap` and rigid horizontal padding clip text (e.g. `تصدير النسخة الاحتياطية`, `حفظ التغييرات والانتقال`).
   - Fix: Buttons must wrap cleanly or use flexible min-heights without clipping.
2. **Active Workout Session Table Overflow:**
   - The 5-column sets table (`مجموعة`, `السابق`, `كجم`, `عدات`, `تم`) exceeds 360px, causing horizontal page jank.
   - Fix: Compact numeric inputs with tabular figures and flexible grid spacing.
3. **Bi-directional String Collisions (Bidi Flips):**
   - Mixed English and Arabic strings like `(Scientific Benefits) الفائدة العلمية والتأثير العضلي` or `(Primary Active Focus) العضلات المستهدفة الأساسية:` cause parentheses to flip direction.
   - Mixed strings with trailing colons (e.g. `الأداة: `, `المستوى: `).
   - Fix: Enforce Arabic-only primary labels; render English sub-text as separate `dir="ltr"` secondary elements; remove trailing colons; wrap numbers with units in `<bdi>`.
4. **Bottom Navigation Labels at 360px:**
   - 5 tabs with long Arabic labels can wrap into two awkward lines or overlap if touch padding is uneven.
   - Fix: Use dense, single-word Arabic labels (`الرئيسية`, `التدريب`, `التغذية`, `التقدم`, `الإعدادات`) with clean 20px icons and fixed equal widths.
5. **Interactive Touch Targets:**
   - Several inline icon buttons and table checkboxes are smaller than the 44px minimum touch target requirement.
   - Fix: Enforce `min-height: 44px` and `min-width: 44px` across all clickable elements.

---

## 6. Audit Conclusion & Implementation Roadmap

Task A will resolve all identified flaws by providing:

1. `src/styles/tokens.css`: The rigid token foundation (Light/Dark, typography, radii, spacing, WCAG AA brand orange).
2. `public/fonts/`: Self-hosted IBM Plex Sans Arabic (`woff2`) for 100% offline support.
3. `src/ui/Icon.tsx` + SVG sprite: Unified Lucide line icons replacing all 71 emojis.
4. `src/utils/bidi.ts`: Intl formatters with `latn` numerals and `stripEmoji()` runtime filter.
5. `src/ui/*`: The complete set of 25+ accessible, RTL-safe UI components.
6. `src/shell/`: Hash-routed application shell wrapping legacy screens safely without breaking data logic.
7. Automated Playwright check suite (`npm run check:ui`).
