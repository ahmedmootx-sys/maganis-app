# Maganis - development-mode workflow

Maganis (مجانص) is an offline-first, privacy-first fitness web app: workouts, the
exercise library and nutrition data all live on the user's device (localStorage
now, IndexedDB later). There is no backend and there are no accounts.

This repository is the production-grade development foundation for that app:
environment separation, a hot-reload dev server, quality gates, tests with
coverage, CI, a rollback procedure and a 15-minute onboarding path.
Phase 1 (onboarding & profiling) is implemented; the workout, exercise and
nutrition modules are next (see docs/ARCHITECTURE.md).

## What works today (Phase 1 - onboarding & profiling)

- Arabic-first RTL UI (`lang="ar" dir="rtl"`), responsive for phone and desktop
- 5-step onboarding wizard: goals (single or compound with a primary goal),
  training days per week, medical assessment with disclaimer, body metrics
  (sex, age, height, weight, activity level with standard multipliers), review
- Per-step validation with specific Arabic error messages
  (pure functions in `src/modules/onboarding/validate.ts`)
- Profile persisted on-device through the namespaced storage wrapper
  (`profile.active` key; dev and prod prefixes never collide)
- Draft autosave (`onboarding.draft`) after every step - close the tab
  mid-wizard and Maganis offers to resume exactly where you stopped
- Welcome-back screen for returning users: profile summary, edit my data,
  delete all my data (with explicit confirmation)
- Save failures surface a readable Arabic banner; silent data loss is forbidden

## Prerequisites

- Node.js >= 20.19 (Node 22 LTS recommended; the repo pins 22 in .nvmrc)
- npm >= 10
- Git (pre-commit hooks require it)

## Quick start

    git clone <repo-url> maganis
    cd maganis
    npm install
    npm run dev

Expected output:

    > maganis@0.1.0 predev
    > node scripts/check-env.mjs development

    Environment OK (mode=development, 5 variables validated)

    > maganis@0.1.0 dev
    > vite

      VITE ready ... Local: http://localhost:5173/

Open http://localhost:5173 - the header shows "مجانص" and a "development"
badge. Fresh visitors get the onboarding wizard; completing it stores the
profile and every later visit opens the welcome-back screen.

## Command reference

| Command               | What it does                                                             |
| --------------------- | ------------------------------------------------------------------------ |
| npm run dev           | Start the dev server with hot reload (validates env + port first)        |
| npm run build         | Typecheck + production build into dist/ (validates production env first) |
| npm run preview       | Serve the production build at http://localhost:4173                      |
| npm test              | Run the test suite once                                                  |
| npm run test:watch    | Run tests in watch mode                                                  |
| npm run test:coverage | Run tests with a coverage report (thresholds enforced)                   |
| npm run lint          | ESLint over the repo                                                     |
| npm run format        | Format everything with Prettier                                          |
| npm run format:check  | Verify formatting without changing files                                 |
| npm run typecheck     | TypeScript project check (no emit)                                       |
| npm run check:env     | Validate .env.development and the dev port                               |
| npm run gates         | lint + format:check + typecheck + test + build in one command            |

## Environment & configuration

| File              | Committed       | Purpose                              |
| ----------------- | --------------- | ------------------------------------ |
| .env.development  | yes             | Defaults for npm run dev / check:env |
| .env.production   | yes             | Defaults for npm run build / preview |
| .env.example      | yes             | Template documenting every variable  |
| .env.<mode>.local | no (gitignored) | Personal overrides; never commit     |
| .env / .env.local | no (gitignored) | Reserved for anything secret         |

Variables: VITE_APP_ENV, VITE_APP_NAME, VITE_STORAGE_PREFIX, VITE_LOG_LEVEL,
VITE_DEV_PORT - all documented in .env.example.

Validation: scripts/check-env.mjs runs before npm run dev (predev) and before
npm run build (prebuild). It collects ALL problems and prints one actionable
line per problem, then exits non-zero. At runtime src/config/appConfig.ts
validates again and renders a readable error screen instead of a stack trace.

Secrets: this project is offline-first and currently needs none. If real
endpoints or keys are ever introduced, they go into .env.<mode>.local on the
deploy machine (gitignored) - never into the committed files, which must stay
placeholder-only. A history scan is recorded in docs/VERIFICATION.md.

The storage prefix intentionally differs per environment (maganis-dev vs
maganis) so dev data and production data can never collide on one origin.

## Testing & coverage

npm test runs Vitest in jsdom. Smoke tests cover the critical paths: config
loading (src/config/appConfig.test.ts), on-device storage
(src/lib/storage.test.ts), the onboarding data layer
(src/modules/onboarding/validate.test.ts and profileStore.test.ts), the app
flow including wizard completion, profile persistence, draft resume and
deletion (src/App.test.tsx) and the configuration error screen
(src/components/ConfigError.test.tsx).

npm run test:coverage produces text + HTML (coverage/) reports and fails below
thresholds: 70 percent lines/statements, 60 percent functions/branches.

## Quality gates & pre-commit hooks

npm run gates = lint + format:check + typecheck + test + build. CI runs the
same gates on every push (see .github/workflows/ci.yml).

Husky + lint-staged run on every commit: staged files are auto-fixed
(ESLint/Prettier); unfixable errors block the commit. After a fresh clone,
npm install wires the hook (verify with: git config core.hooksPath, expected
value .husky/_).

## CI

GitHub Actions runs on every push and on PRs against main: install, lint,
format check, typecheck, tests with coverage, production build. The workflow
file is validated in docs/VERIFICATION.md; the first live green run appears
once the repo is pushed to a GitHub remote (none existed in the build
environment).

## Production build & preview

npm run build produces dist/ (typecheck included). npm run preview serves it
at http://localhost:4173 with strictPort (fails loudly if the port is taken).

## Failure behavior (what errors look like)

- Missing/invalid env var: predev stops with a list of every bad variable and
  how to fix it (captured samples in docs/VERIFICATION.md).
- Port already in use: predev names the port and the PID holding it, with two
  fix options; Vite strictPort is the second line of defense.
- Invalid runtime config in a built artifact: the app renders a readable
  "Configuration error" screen instead of a stack trace.
- Storage full or blocked on save: the wizard shows a readable Arabic banner;
  nothing is written silently.

## Rollback

See docs/ROLLBACK.md (annotated release tags, git revert workflow, drill log
with evidence).

## 15-minute onboarding path

- 0-3 min: install prerequisites, clone, npm install
- 3-5 min: npm run dev, open the app, complete the wizard, reload to see the
  welcome-back screen (persistence proof)
- 5-8 min: read .env.example and src/config/appConfig.ts
- 8-12 min: npm run test:coverage, open coverage/index.html
- 12-15 min: run npm run gates end-to-end, then skim docs/ARCHITECTURE.md

Cold-cache note: the first npm install downloads ~300 packages; allow 3-5
minutes on a slow connection.

## Troubleshooting

- "Port 5173 is already in use": stop the listed PID or set VITE_DEV_PORT in
  .env.development, then restart npm run dev.
- "Environment validation FAILED": fix the variables it lists; run
  npm run check:env until it prints "Environment OK".
- Hooks do not run on commit: run npm install again and check
  git config core.hooksPath (should be .husky/_).
- Engine errors about Node version: use Node >= 20.19 (22 LTS recommended).
- npm install fails behind a proxy: configure the npm proxy or a mirror; the
  registry used when building this repo was https://registry.npmjs.org/.
- Tests fail after editing .env files: invalid values surface through
  check-env and appConfig - fix the listed variables.
