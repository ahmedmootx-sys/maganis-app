# PROFILE EFFECTS & ONBOARDING DATA CONSUMER AUDIT

_Documenting every onboarding and profile field, its data domain, existing consumers, and G6-B enforced effects._

## 1. Inventory Table

| Profile Field               | Allowed / Onboarding Values                                                              | Existing Consumers (Pre G6-B)                                        | G6-B Consumer & Enforced Effect                                                                                                                                                                  | Consumer Category / Test                                          |
| :-------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `name`                      | string (optional)                                                                        | `Dashboard.tsx`, `SettingsScreen.tsx`                                | Profile greeting and account identity                                                                                                                                                            | `display_only: User display identity across headers`              |
| `primaryGoal`               | `hypertrophy`, `cut`, `flexibility`, `calisthenics`                                      | `programGenerator.ts`, `computeEnergyPlan.ts`                        | Program rep ranges, volume targets, nutrition adjustment                                                                                                                                         | `functional: generatorMatrix.test.ts, computeEnergyPlan.test.ts`  |
| `goals`                     | Array of `Goal`                                                                          | `SettingsScreen.tsx`                                                 | Secondary goals display & AI prompt context                                                                                                                                                      | `functional: aiPromptPrivacy.test.ts`                             |
| `bodyGoal`                  | `gain`, `maintain`, `cut`, `recomp`                                                      | `computeEnergyPlan.ts`                                               | Determines caloric surplus / deficit / maintenance in nutrition engine                                                                                                                           | `functional: computeEnergyPlan.test.ts`                           |
| `trainingStyle`             | `weights`, `calisthenics`, `mobility`, `mixed`                                           | G6-B Enforced                                                        | `deriveConstraints(profile)`: `calisthenics` restricts equipment to `bodyweight`, `none`, `other` (bars/parallettes) and disallows weighted exercises; `mobility` prioritizes bodyweight & bands | `functional: profileConstraints.test.ts, generatorMatrix.test.ts` |
| `trainingLocation`          | `gym`, `home`, `both`                                                                    | G6-B Enforced                                                        | `deriveConstraints(profile)`: `home` without gym equipment limits catalog to `dumbbell`, `bodyweight`, `none`, `other`                                                                           | `functional: profileConstraints.test.ts, generatorMatrix.test.ts` |
| `experienceLevel`           | `beginner`, `intermediate`, `advanced`                                                   | `programGenerator.ts` (partial)                                      | `deriveConstraints(profile)`: `levelCeiling` caps exercise difficulty (e.g. beginner excludes advanced technical lifts); adjusts starting volume                                                 | `functional: profileConstraints.test.ts, generatorMatrix.test.ts` |
| `equipmentAvailable`        | Array of equipment keys (`barbell`, `dumbbell`, `machine`, `cables`, `bodyweight`, etc.) | G6-B Enforced                                                        | `deriveConstraints(profile)`: `allowedEquipment` matches catalog `equipment.db`. Generators, library filters, and AI prompts only pick allowed items                                             | `functional: profileConstraints.test.ts, libraryFilter.test.ts`   |
| `trainingDaysPerWeek`       | integer 2 to 6                                                                           | `programGenerator.ts`, `weekLoadSelector.ts`, `computeEnergyPlan.ts` | Day count generated in weekly plan; schedule mismatch detection; workout calorie frequency                                                                                                       | `functional: weekLoadProperty.test.ts, generatorMatrix.test.ts`   |
| `sessionMinutes`            | integer (15 to 120, default 60)                                                          | `computeEnergyPlan.ts`                                               | EAT energy expenditure calculation                                                                                                                                                               | `functional: computeEnergyPlan.test.ts`                           |
| `sessionIntensity`          | `light`, `moderate`, `hard`                                                              | `computeEnergyPlan.ts`                                               | MET intensity multiplier in EAT formula                                                                                                                                                          | `functional: computeEnergyPlan.test.ts`                           |
| `medical.hasIssues`         | boolean                                                                                  | `LimitationsEditor.tsx`, `OnboardingWizard.tsx`                      | Activates health callouts and limitation checks                                                                                                                                                  | `functional: limitations.test.ts`                                 |
| `medical.injuryTags`        | string[]                                                                                 | `filterByInjuries` in `exercises.ts`                                 | Excludes exercises with matching injury tags                                                                                                                                                     | `functional: limitations.test.ts`                                 |
| `medical.notes`             | string                                                                                   | `SettingsScreen.tsx`, `LimitationsEditor.tsx`                        | User-authored medical notes                                                                                                                                                                      | `display_only: Free-text coach reference notes`                   |
| `limitations`               | `UserLimitation[]` (`region`, `status`, `note`)                                          | `limitations.ts`, `ExerciseDetailView.tsx`                           | `deriveConstraints(profile)`: Active limitations (`current_pain`, `under_treatment`) exclude `high` load exercises from `exercise-region-load.json`                                              | `functional: profileConstraints.test.ts`                          |
| `redFlag`                   | boolean                                                                                  | `OnboardingWizard.tsx`, `Dashboard.tsx`                              | Shows referral warning callout if true                                                                                                                                                           | `functional: limitations.test.ts`                                 |
| `redFlagDismissed`          | boolean                                                                                  | `Dashboard.tsx`                                                      | Hides referral warning callout after dismissal                                                                                                                                                   | `functional: limitations.test.ts`                                 |
| `body.sex`                  | `male`, `female`                                                                         | `computeEnergyPlan.ts`                                               | MSJ BMR equation gender constant (+5 vs -161)                                                                                                                                                    | `functional: computeEnergyPlan.test.ts`                           |
| `body.age`                  | integer (14 to 80)                                                                       | `computeEnergyPlan.ts`                                               | MSJ BMR equation age term (-5 * age)                                                                                                                                                             | `functional: computeEnergyPlan.test.ts`                           |
| `body.heightCm`             | float (120 to 230)                                                                       | `computeEnergyPlan.ts`                                               | MSJ BMR equation height term (+6.25 * height)                                                                                                                                                    | `functional: computeEnergyPlan.test.ts`                           |
| `body.weightKg`             | float (30 to 250)                                                                        | `computeEnergyPlan.ts`, `cardioEngine.ts`, `setLogging`              | MSJ BMR equation weight term (+10 * weight); cardio gross/net burn rate; bodyweight scaling                                                                                                      | `functional: computeEnergyPlan.test.ts, cardioEngine.test.ts`     |
| `body.activityLevel`        | `sedentary`, `light`, `moderate`, `active`, `very_active`                                | `computeEnergyPlan.ts`                                               | Legacy activity factor multiplier                                                                                                                                                                | `functional: computeEnergyPlan.test.ts`                           |
| `body.lifestyle`            | integer 1 to 5                                                                           | `computeEnergyPlan.ts`                                               | NEAT lifestyle factor multiplier (1.2 to 1.7)                                                                                                                                                    | `functional: computeEnergyPlan.test.ts`                           |
| `body.pace`                 | `slow`, `standard`, `fast`                                                               | `computeEnergyPlan.ts`                                               | Weekly weight change rate (0.25% to 1.0% BW/week)                                                                                                                                                | `functional: computeEnergyPlan.test.ts`                           |
| `body.formulaOverride`      | `auto`, `mifflin`, `katch`                                                               | `computeEnergyPlan.ts`                                               | Selects formula in calculation engine                                                                                                                                                            | `functional: computeEnergyPlan.test.ts`                           |
| `body.proteinPerKgOverride` | float (optional)                                                                         | `computeEnergyPlan.ts`                                               | Overrides default protein recommendation (1.6 - 2.2 g/kg)                                                                                                                                        | `functional: computeEnergyPlan.test.ts`                           |
| `weekStartDay`              | integer (0 to 6, default 6 Saturday)                                                     | `dateUtils.ts`, `WeeklyPlanView.tsx`                                 | Week layout display & calendar day ordering                                                                                                                                                      | `functional: dateUtils.test.ts`                                   |
| `schedule`                  | `Record<number, string>` (weekday to dayId)                                              | `WeeklyPlanView.tsx`                                                 | Assigns workout days to specific calendar weekdays                                                                                                                                               | `functional: dayOperationsInvariants.test.ts`                     |
| `painLog`                   | `PainLogEntry[]`                                                                         | `LimitationsEditor.tsx`, `ProgressScreen.tsx`                        | Tracks joint and muscle pain reports over time                                                                                                                                                   | `functional: limitations.test.ts`                                 |

---

## 2. G6-B Pure Derivation Contract: `deriveConstraints(profile)`

The single source of truth for converting onboarding answers into actionable workout constraints:

```typescript
interface UserWorkoutConstraints {
  allowedEquipment: Set<string> // Real catalog equipment values: 'barbell', 'dumbbell', 'body only', 'cable', 'machine', 'none', 'other'
  allowsLoadedExercises: boolean // false if bodyweight/calisthenics only
  levelCeiling: 'beginner' | 'intermediate' | 'advanced'
  excludedExerciseKeys: Set<string> // Derived from active region limitations (high load in exercise-region-load.json)
  isCalisthenicsOnly: boolean
  isHomeOnly: boolean
}
```

### Equipment Mapping Specification:

1. **Calisthenics / Bodyweight** (`trainingStyle.includes('calisthenics')` or `primaryGoal === 'calisthenics'` without loaded gym access):
   - Allowed: `['body only', 'none', 'other']`
   - Disallowed: `['barbell', 'dumbbell', 'cable', 'machine']`
   - `allowsLoadedExercises`: `false`
2. **Home Gym with Dumbbells** (`trainingLocation === 'home'` and `equipmentAvailable` includes dumbbells):
   - Allowed: `['dumbbell', 'body only', 'none', 'other']`
   - Disallowed: `['barbell', 'cable', 'machine']`
   - `allowsLoadedExercises`: `true`
3. **Full Commercial Gym / Unrestricted** (`trainingLocation === 'gym'` or `'both'`, or unconstrained):
   - Allowed: All catalog equipment values.
   - `allowsLoadedExercises`: `true`

### Limitations Mapping Specification:

- Active limitations (`status === 'current_pain' | 'under_treatment'`):
  - Look up exercise in `exercise-region-load.json`.
  - If `loads[limitation.region] === 'high'`, add exercise ID to `excludedExerciseKeys`.
  - If exercise is unreviewed, do not exclude silently, but display appropriate warning tag in details.
- Old recovered limitations (`status === 'old_recovered'`):
  - Do not exclude; provide informative tag.

---

## 3. Disallowed Exercises Program Mismatch Callout Contract

When a user updates their profile (e.g. changes equipment from gym to calisthenics or adds a shoulder limitation), any existing workout program containing exercises now outside `allowedEquipment` or inside `excludedExerciseKeys` triggers an action banner in `WeeklyPlanView.tsx`:

- Notice: "تمارين غير متوافقة مع إعداداتك الجديدة" (listing the count and exercises).
- Action 1: "استبدلهم بتمارين مناسبة" (replaces each disallowed exercise with the highest-ranked allowed exercise for the same muscle group, retaining sets and reps).
- Action 2: "سيبهم" (dismisses the callout, keeping the user's manual choice intact).
