# CI Gating Evidence & Remote Execution Report (Task H4.1)

## 1. Remote Push Attempt & Authentication Scope Restriction

In accordance with Task H4.1 Requirement 4 and Operating Rules P7 and P9, a push to GitHub was executed to trigger remote GitHub Actions runs.

### Command Executed:

```bash
git push origin HEAD:test-ci-green
```

### Exact Terminal Output Received:

```
To https://github.com/<remote-owner>/maganis-app.git
 ! [remote rejected] HEAD -> test-ci-green (refusing to allow a Personal Access Token to create or update workflow `.github/workflows/deploy.yml` without `workflow` scope)
error: failed to push some refs to 'https://github.com/<remote-owner>/maganis-app.git'
```

### Why Remote Push is Blocked:

- The local Git environment is configured with a GitHub Personal Access Token (PAT) that has standard repository read/write permissions (`repo` scope), but lacks the administrative `workflow` scope.
- Because Task H4.1 required modifying `.github/workflows/deploy.yml` (to unify CI gating before deployment) and removing `.github/workflows/ci.yml` (to eliminate duplicate runs), GitHub enforces a security policy requiring the `workflow` scope to modify any file within `.github/workflows/`.
- Per Rule P7 ("do not fabricate a run ID; write 'not verified on GitHub' and give the local equivalent"), remote run IDs and URLs are **not verified on GitHub** due to this permission restriction.

---

## 2. Local Gate Equivalence & Proof of Gating

All gates defined in `.github/workflows/deploy.yml` were executed in exact order locally against the production build:

```bash
npm run gates
```

### Exact Sequence of Executed Steps:

1. **`node scripts/gate-no-personal-data.mjs`**:
   - **Result**: PASSED
   - Scanned 1,293 files across 6 strict rules. 0 violations found.
   - Red evidence: `evidence/h4/red/gate-no-personal-data.txt` (32 violations before purge).
   - Green evidence: `evidence/h4/green/gate-no-personal-data.txt` (0 violations).

2. **`npm run check:emoji`**:
   - **Result**: PASSED
   - 0 forbidden emojis found across `src/` and `data/`.

3. **`npm run lint`**:
   - **Result**: PASSED
   - 0 ESLint errors (15 warnings in test mock types).

4. **`npm run format:check`**:
   - **Result**: PASSED
   - All files formatted with Prettier code style.

5. **`npm run typecheck`**:
   - **Result**: PASSED
   - `tsc -b` completed with 0 errors.

6. **`npm run test:coverage`**:
   - **Result**: PASSED
   - 533 tests passed across 44 test suites.

7. **`node scripts/check-coverage-ratchet.mjs`**:
   - **Result**: PASSED
   - Reads `coverage/coverage-summary.json` against `coverage-baseline.json`.
   - Measured coverage vs. baseline:
     - Lines: 42.49% >= 42.39% (baseline: 42.49%)
     - Statements: 42.49% >= 42.39% (baseline: 42.49%)
     - Functions: 37.00% >= 36.90% (baseline: 37.00%)
     - Branches: 62.91% >= 62.81% (baseline: 62.91%)
   - Red evidence: `evidence/h4/red/coverage-ratchet.txt` (simulated regression by raising baseline floors; gate failed).
   - Green evidence: `evidence/h4/green/coverage-ratchet.txt` (real baseline verified green).

8. **`npm run build`**:
   - **Result**: PASSED
   - Production bundle compiled. Initial JS chunk: 458.92 kB raw + 192.49 kB React vendor = 651.41 kB raw / 179.20 kB gzip (well within the 800 kB budget).
   - `exercise-catalog` chunk (499.08 kB) dynamically loaded on demand, never preloaded in `index.html`.

9. **`node scripts/gate-raw-tokens.mjs`**:
   - **Result**: PASSED
   - Examined 480 visible text nodes across 8 registered application states. 0 raw internal tokens or unescaped Latin text found.

10. **`npm run check:ui`**:
    - **Result**: PASSED
    - Checked 108 matrix runs (360x780, 390x844, 430x932 @ 100% and 130% font scales, light and dark themes).
    - Enforced honest touch-target check (`rect.width < 44 || rect.height < 44`) with zero exclusions.
    - Red evidence: `evidence/h4/red/check-ui-red.txt` (multiple buttons failed 44px threshold).
    - Green evidence: `evidence/h4/green/check-ui-green.txt` (0 failures).

11. **`node qa/video-flow.mjs`**:
    - **Result**: PASSED (7/7 checks)
    - Field visibility, focus, play facade, iframe visible height (200px), nocookie embed.

12. **`node qa/media-everywhere.mjs`**:
    - **Result**: PASSED (11/11 surface & offline checks)
    - Custom images, static JPEG first-frame thumbnails for GIFs, offline IndexedDB cache persistence.

13. **`node qa/reset-flow.mjs`**:
    - **Result**: PASSED (14/14 checks)
    - Two-tier factory reset: "احتفظ بتعديلات التمارين" preserves exercise overrides & media; "امسح كل حاجة" wipes all stores.

14. **`node qa/backup-restore.mjs`**:
    - **Result**: PASSED (11/11 checks)
    - Zod schema import validation, hostile fixture rejection (`qa/fixtures/`), preview counts, automatic pre-import snapshot rollback.

---

## 3. How to Enable GitHub Actions Workflow Pushes

To allow Git to push workflow modifications to GitHub:

1. Generate a new Personal Access Token at `https://github.com/settings/tokens`.
2. Check both the `repo` scope and the `workflow` scope ("Update GitHub Action workflows").
3. Update local Git credentials with the new token.
