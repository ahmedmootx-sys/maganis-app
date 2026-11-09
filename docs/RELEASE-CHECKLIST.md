# Maganis Native Release Checklist & Protocol

This document outlines the step-by-step procedure for preparing, verifying, and publishing an official signed release APK of Maganis («مجانص»).

---

## 1. Pre-Release Verification (Local Gates)

Before bumping versions or tagging:

- [ ] Working branch is clean and up to date with `main`.
- [ ] TypeScript check passes: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`
- [ ] Unit test suite passes: `npm test`
- [ ] Bundle ratchet passes: `node scripts/check-bundle-ratchet.mjs`
- [ ] Consolidated Native E2E suite passes: `node scripts/native-e2e/index.mjs`
- [ ] Privacy gate passes: `node scripts/gate-no-personal-data.mjs`
- [ ] Zero third-party telemetry audit passes: `node scripts/audit-network-privacy.mjs`
- [ ] Production web build succeeds: `npm run build`
- [ ] Native production build succeeds: `npm run build:native`

---

## 2. Version & Changelog Preparation

- [ ] **Increment Version**:
  - In `package.json`: update `"version": "0.x.y"`.
  - In `android/app/build.gradle`:
    - Increment `versionCode` (monotonically increasing integer, e.g. `10001` -> `10002`).
    - Update `versionName` to match `0.x.y`.
- [ ] **Update `CHANGELOG.md`**:
  - Add version header: `## [0.x.y] - YYYY-MM-DD`.
  - Include `### ar` section with exactly 2 to 4 bullet points in simple Egyptian Arabic (user-facing improvements only).
  - Include `### en` section with technical developer notes.
  - No HTML formatting in Arabic changelog notes (must be plain markdown for the in-app update checker parser).

---

## 3. Git Tagging & CI Release Trigger

- [ ] Commit version bumps and changelog:
  ```bash
  git commit -m "chore(release): v0.x.y [skip ci]"
  ```
- [ ] Create annotated git tag:
  ```bash
  git tag -a v0.x.y -m "Release v0.x.y"
  ```
- [ ] Push commit and tag to GitHub:
  ```bash
  git push origin main
  git push origin v0.x.y
  ```

---

## 4. GitHub Actions CI Verification

- [ ] Navigate to GitHub Actions tab: `https://github.com/ahmedmootx-sys/maganis-app/actions`.
- [ ] Verify `android.yml` workflow run for tag `v0.x.y`:
  - `build-debug` job: succeeded.
  - `emulator-e2e` job: all 22 E2E test scenarios passed.
  - `release` job: signed APK compiled successfully.
- [ ] Verify Release Artifacts on GitHub Releases page:
  - Release title: `Maganis v0.x.y`.
  - APK file: `maganis-v0.x.y-XXXXX.apk`.
  - Checksum file: `SHA256SUMS`.
  - Size check: APK is within reasonable bounds (~6-12 MB).

---

## 5. Post-Release Integrity & Sideload Verification

- [ ] Download release APK on a physical test device.
- [ ] Verify update installs smoothly over previous version without requiring uninstallation (when signing keys match).
- [ ] Confirm in-app Version badge shows `v0.x.y`.
- [ ] Confirm all previously saved data, workouts, and settings are intact.
- [ ] Check Diagnostics sheet: storage health is `ok`, no crash logs generated.

---

## 6. Android Signing Key Mismatches & Data Safety

Android enforces strict signature matching across updates. If an incoming APK was signed with a different key than the installed APK (e.g., updating from a throwaway CI debug APK to a release APK, or across builds with different debug keystores):

1. **Android Rejection**: Android will refuse to install the update with `INSTALL_FAILED_UPDATE_INCOMPATIBLE` ("App not installed as package conflicts with an existing package").
2. **Consequence of Uninstallation**: Uninstalling the existing app causes Android to delete `/data/data/app.maganis.coach*/`, destroying all internally stored workouts, nutrition logs, and local databases.
3. **Mandatory Recovery Protocol**:
   - **Step 1 (Export Snapshot)**: Open the old app -> Settings -> Backup -> Tap "أخذ نسخة متأكد منها الآن" (Take Verified Backup Now) and export the JSON snapshot to public `Download/Maganis/` or share via WhatsApp/Drive.
   - **Step 2 (Uninstall Old App)**: Once the backup file is confirmed safe, uninstall the old app.
   - **Step 3 (Install New APK)**: Install the new APK.
   - **Step 4 (Restore Snapshot)**: Launch the new app -> in the Onboarding screen or Settings -> Backup -> Tap "استعادة البيانات" (Restore Data), select the exported snapshot, and confirm. All personal data is 100% restored.
