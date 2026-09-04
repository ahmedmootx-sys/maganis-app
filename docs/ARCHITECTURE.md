# Maganis - architecture & roadmap

## Chosen stack (current foundation)

| Layer              | Choice                                                    | Why                                                      |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------- |
| Build & dev server | Vite 7                                                    | Instant HMR, first-class env modes, fast builds          |
| UI                 | React 19 + TypeScript (strict)                            | Component model, typed config and storage layers         |
| Dev tests          | Vitest 3 + Testing Library (jsdom)                        | Same transform pipeline as Vite, fast, coverage built in |
| Quality            | ESLint 9 (flat) + Prettier 3 + tsc -b + husky/lint-staged | Enforced gates locally and in CI                         |
| Persistence        | localStorage behind a namespaced wrapper                  | Offline-first, zero backend; IndexedDB comes next        |
| CI                 | GitHub Actions                                            | Free tier, runs the same gates as local                  |

## Deliberately out of scope for now

No backend, no accounts, no server sync. All user data stays on-device - this
is a hard product constraint, not an optimization.

## Implemented modules

### Phase 1 - onboarding & profiling (done)

- `src/modules/onboarding/types.ts` - domain model (UserProfile, goals,
  activity levels with the standard multipliers that will feed Mifflin-St
  Jeor TDEE in the nutrition module).
- `src/modules/onboarding/validate.ts` - pure validation functions returning
  specific Arabic messages; shared by the wizard steps and the final save.
- `src/modules/onboarding/profileStore.ts` - profile + draft persistence on
  top of the namespaced storage wrapper (`profile.active`,
  `onboarding.draft`). Save failures propagate to the UI; silent loss is
  forbidden.
- `src/modules/onboarding/OnboardingWizard.tsx` - 5-step wizard (goals with
  compound-goal primary pick, days per week, medical assessment with
  disclaimer, body metrics, review), draft autosave per step, resume prompt.
- `src/modules/onboarding/WelcomeBack.tsx` - returning-user summary with
  edit / delete-all-data (explicit two-step confirmation).
- Arabic-first RTL UI: `index.html` is `lang="ar" dir="rtl"`; CSS uses
  logical properties. Validation is hand-rolled (pure functions + tests)
  instead of adding zod/react-hook-form; this keeps runtime dependencies at
  react + react-dom only.

## Planned additions (next phases)

- IndexedDB via Dexie for workout/exercise/nutrition data volumes (localStorage
  stays for small settings; the storage wrapper will gain a Dexie driver).
- vite-plugin-pwa for a service worker + installability (true offline app).
- Nutrition math: Mifflin-St Jeor BMR with the stored activity multipliers for
  TDEE, then macro targets - real physiological formulas, no magic numbers.
- Workout program generator (progressive overload, muscle recovery) and the
  exercise database with custom exercises (GIF references).

## Target project structure

    src/
      config/        appConfig - validated environment config (done)
      lib/           storage wrapper now; db (Dexie), tdee, program engine later
      modules/
        onboarding/  profile wizard + persistence (done)
        workout/     weekly program generator (progressive overload, recovery)
        exercises/   exercise database + custom exercise builder (GIF refs)
        nutrition/   TDEE, macro targets, meal log, food database
      components/    shared UI
    scripts/         check-env (startup validation)
    docs/            architecture, rollback, verification, acceptance

## Roadmap

1. Phase 0 (this repo): dev-mode workflow - env separation, HMR, gates, tests,
   CI, rollback, handover docs. DONE.
2. Phase 1: onboarding & profiling + persistence. DONE (localStorage behind
   the wrapper; IndexedDB driver arrives with the exercise DB volumes).
3. Phase 2: exercise database + workout generator engine.
4. Phase 3: nutrition & calorie module (Mifflin-St Jeor TDEE, macro targets).
5. Phase 4: PWA offline hardening.
