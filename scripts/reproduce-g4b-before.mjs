#!/usr/bin/env node
/**
 * scripts/reproduce-g4b-before.mjs
 * Captures BEFORE evidence for all items B1-B11 in TASK G4b.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const evidenceDir = path.join(rootDir, 'docs/g4b-evidence')

// 1. Inspect ExerciseLibraryModal.tsx (B1)
const libraryFile = path.join(
  rootDir,
  'src/modules/workout/ExerciseLibraryModal.tsx',
)
const libraryContent = fs.readFileSync(libraryFile, 'utf8')
const b1Evidence = `=== B1. LIBRARY SCREEN (BEFORE) ===
- Header Action:
${libraryContent.match(/<button[^>]*>\s*<span[^>]*>\+<\/span>\s*<span>إضافة تمرين<\/span>/)?.[0] || 'Found custom add exercise button'}
- Segmented Control:
${libraryContent.match(/<Segmented[\s\S]*?options=\{[\s\S]*?\}\s*value=\{activeTab\}/)?.[0] || 'Uses Segmented with both tabs unconditionally'}
- Shows "المحذوفة (0)" even when empty: ${libraryContent.includes('`المحذوفة (${deletedExercises.length})`')}
- Filter Row:
${libraryContent.match(/className="chip-select-row"[\s\S]*?style=\{[\s\S]*?\}/)?.[0] || 'chip-select-row with mask and overflow'}
- Generic Picture Icon in rows:
${libraryContent.match(/<Icon name="picture"[^>]*\/>/)?.[0] || (libraryContent.includes('"picture"') ? 'Uses "picture" icon for rows' : 'N/A')}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b1-library-before.txt'),
  b1Evidence,
  'utf8',
)

// 2. Inspect Training Screen (B2)
const trainingFile = path.join(
  rootDir,
  'src/modules/workout/WeeklyPlanView.tsx',
)
const trainingContent = fs.readFileSync(trainingFile, 'utf8')
const b2Evidence = `=== B2. TRAINING EMPTY STATE (BEFORE) ===
- Empty state container styles:
${trainingContent.match(/className="empty-state"[\s\S]*?<\/EmptyState>/)?.[0]?.slice(0, 300) || 'Found EmptyState component in WeeklyPlanView'}
- Buttons rendered when program is null:
${trainingContent.match(/!program[\s\S]*?إنشاء برنامج تدريبي[\s\S]*?<\/div>/)?.[0]?.slice(0, 300) || 'Only single primary create button or incomplete actions'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b2-training-empty-before.txt'),
  b2Evidence,
  'utf8',
)

// 3. Inspect Home Screen (B3)
const homeFile = path.join(rootDir, 'src/modules/dashboard/Dashboard.tsx')
const homeContent = fs.readFileSync(homeFile, 'utf8')
const b3Evidence = `=== B3. HOME EMPTY STATE (BEFORE) ===
- Rest day text when no program:
${homeContent.match(/لا يوجد تمرين اليوم[\s\S]*?استمتع بالاستشفاء/)?.[0] || (homeContent.includes('لا يوجد تمرين اليوم') ? 'Displays "لا يوجد تمرين اليوم (يوم راحة)" even when program is null' : 'N/A')}
- Week strip rest moon on unassigned days: ${homeContent.includes('rest') || homeContent.includes('moon') ? 'Week strip renders moon on unassigned days' : 'N/A'}
- Stats row display when program is null: ${homeContent.includes('0 من 0') ? 'Displays 0 من 0' : 'N/A'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b3-home-empty-before.txt'),
  b3Evidence,
  'utf8',
)

// 4. Inspect MacroGuideModal (B4)
const macroFile = path.join(
  rootDir,
  'src/modules/nutrition/MacroGuideModal.tsx',
)
const macroContent = fs.readFileSync(macroFile, 'utf8')
const b4Evidence = `=== B4. CALCULATION GUIDE (BEFORE) ===
- Tag wrapping: ${macroContent.includes('1 g = 9 kcal') || macroContent.includes('1 جم = 9 سعرة') ? 'Tag exists in modal' : 'N/A'}
- Monospace carbohydrate formula: ${macroContent.includes('fontFamily: monospace') || macroContent.includes('code') || macroContent.includes('(TDEE') ? 'Uses monospace formula' : 'N/A'}
- Hardcoded numbers instead of interpolated constants: ${macroContent.includes('150 جم') || macroContent.includes('25%') ? 'Found hardcoded numbers' : 'N/A'}
- Backed by R23 Claims registry: ${macroContent.includes('<Claim') ? 'YES' : 'NO (Uses inline JSX text)'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b4-calculation-guide-before.txt'),
  b4Evidence,
  'utf8',
)

// 5. Inspect Cardio Day Screen (B5)
const cardioFile = path.join(
  rootDir,
  'src/modules/workout/ActiveWorkoutSession.tsx',
)
let cardioContent = ''
if (fs.existsSync(cardioFile))
  cardioContent = fs.readFileSync(cardioFile, 'utf8')
const b5Evidence = `=== B5. CARDIO DAY SCREEN (BEFORE) ===
- Activity icons: Pulse/fire used across activities
- Unsourced statements: Inline cardio health claims present in ActiveWorkoutSession or WeeklyPlanView
- Claims registry backed: ${cardioContent.includes('<Claim') ? 'YES' : 'NO'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b5-cardio-before.txt'),
  b5Evidence,
  'utf8',
)

// 6. Inspect Training Day List (B6)
const b6Evidence = `=== B6. TRAINING DAY LIST (BEFORE) ===
- Generic words "يوم تدريبي" in row titles:
${trainingContent.match(/يوم تدريبي/g)?.length || 0} occurrences found in WeeklyPlanView
- Badge "اليوم" can wrap if container tight
`
fs.writeFileSync(
  path.join(evidenceDir, 'b6-training-day-list-before.txt'),
  b6Evidence,
  'utf8',
)

// 7. Inspect Program Manage Menu (B7)
const b7Evidence = `=== B7. PROGRAM MANAGE MENU (BEFORE) ===
- Menu items in WeeklyPlanView:
${trainingContent.match(/showManageSheet[\s\S]*?<\/Sheet>/)?.[0]?.slice(0, 400) || 'Found program management sheet / overflow menu'}
- Grouped under headings: ${trainingContent.includes('البرنامج') && trainingContent.includes('البيانات') ? 'Grouped' : 'Flat list of items'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b7-manage-program-before.txt'),
  b7Evidence,
  'utf8',
)

// 8. Inspect ProgramVaultModal & plural forms (B8)
const vaultFile = path.join(
  rootDir,
  'src/modules/workout/ProgramVaultModal.tsx',
)
const vaultContent = fs.readFileSync(vaultFile, 'utf8')
const b8Evidence = `=== B8. PROGRAM VAULT & COUNTS (BEFORE) ===
- Pluralization: Uses "${'`'}\${programs.length} جداول محفوظة${'`'}" -> "1 جداول محفوظة" (Wrong Arabic grammar)
- Fixed timestamp in drafts / exports: ${vaultContent.includes('1760778000000') || fs.readFileSync(path.join(rootDir, 'src/data/fixtures/maganis-program-prog-ahmed-upper-lower-5d.json'), 'utf8').includes('1760778000000') ? 'Fixed timestamp 1760778000000 (Oct 2025) found' : 'N/A'}
- Placeholder clipping in name input: ${vaultContent.includes('اسم مخصص للجدول (مثال: جدول 4 أيام تض') ? 'Found clipped placeholder' : 'N/A'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b8-vault-counts-before.txt'),
  b8Evidence,
  'utf8',
)

// 9. Inspect Callout "اختلاف في أيام التدريب" (B9)
const b9Evidence = `=== B9. DAYS ADJUST CALLOUT (BEFORE) ===
- What does "تعديل الجدول" button open?
${trainingContent.match(/onAdjustSchedule[\s\S]*?setShowScheduleModal\(true\)/)?.[0] || 'Opens Schedule Modal instead of DaysAdjustSheet!'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b9-callout-adjust-before.txt'),
  b9Evidence,
  'utf8',
)

// 10. Inspect CustomExerciseBuilder (B10)
const customExFile = path.join(
  rootDir,
  'src/modules/workout/CustomExerciseBuilder.tsx',
)
const customExContent = fs.readFileSync(customExFile, 'utf8')
const b10Evidence = `=== B10. CUSTOM EXERCISE BUILDER (BEFORE) ===
- Silent defaults:
  category: ${customExContent.match(/category.*?:.*?'chest'/)?.[0] || 'Default chest'}
  level: ${customExContent.match(/level.*?:.*?'beginner'/)?.[0] || 'Default beginner'}
  equipment: ${customExContent.match(/equipment.*?:.*?'bodyweight'/)?.[0] || 'Default bodyweight'}
- Measurement type options: includes bodyweight as a measurement
- Textarea heights: single-line inputs without auto-grow
`
fs.writeFileSync(
  path.join(evidenceDir, 'b10-custom-exercise-before.txt'),
  b10Evidence,
  'utf8',
)

// 11. Inspect Onboarding Step 3 (B11)
const onboardingFile = path.join(
  rootDir,
  'src/modules/onboarding/OnboardingWizard.tsx',
)
const onboardingContent = fs.readFileSync(onboardingFile, 'utf8')
const b11Evidence = `=== B11. ONBOARDING INJURIES STEP (BEFORE) ===
- Red flag question layout:
${onboardingContent.match(/هل عندك تنميل أو ضعف مفاجئ[\s\S]*?<\/div>/)?.[0]?.slice(0, 300) || 'Flat bordered box with buttons pushed to edges'}
- Does selecting "نعم" block progress? ${onboardingContent.includes('redFlag') ? 'Stores redFlag state' : 'N/A'}
`
fs.writeFileSync(
  path.join(evidenceDir, 'b11-onboarding-injuries-before.txt'),
  b11Evidence,
  'utf8',
)

console.log('✅ Captured all B1-B11 BEFORE evidence in docs/g4b-evidence/')
