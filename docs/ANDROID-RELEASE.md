# Android Release & Packaging Specification

This document details the automated Android packaging, code-signing, and release workflows for maintainers.

## 1. Automated Architecture

The native Android APK pipeline is fully driven by GitHub Actions in `.github/workflows/android.yml`.

- **Debug Builds:** Produced on every push to `main` and `native/**`. Packaged as artifacts named `maganis-DEBUG-NOT-FOR-REAL-DATA-<sha>.apk`. Signed using standard ephemeral debug keys.
- **Production Releases:** Triggered only when a release tag matching `v*` (e.g. `v0.2.0`) is pushed to GitHub. Requires all verification gates to pass before building `assembleRelease`.

---

## 2. Versioning Scheme

- `versionName`: Read dynamically from `package.json` (`version` field).
- `versionCode`: Derived from GitHub run number offset: `GITHUB_RUN_NUMBER + 1000`. This guarantees strictly monotonically increasing integer version codes across CI runs, satisfying Android package manager upgrade requirements. Defaults to `1` for local standalone tests.

---

## 3. Code Signing & Security Verification (Rules S1 - S5)

- **Keystore Storage:** The production keystore is stored encrypted as a base64 GitHub Secret `ANDROID_KEYSTORE_BASE64`. It is decoded into `$RUNNER_TEMP` during release CI and permanently deleted at job conclusion.
- **Signature Integrity Check:** CI computes the SHA-256 certificate fingerprint from the built APK via `apksigner` and compares it against `vars.ANDROID_CERT_SHA256`. The release job fails immediately on any mismatch.
- **No Debug Fallback (S4):** `android/app/build.gradle` enforces that `assembleRelease` fails immediately if signing credentials or keystore files are missing.

---

## 4. Release Artifacts

Each tagged release attaches:

1. `maganis-<versionName>.apk`: Signed production APK for sideloading.
2. `maganis-<versionName>.apk.sha256`: Checksum for supply chain verification.
3. Release notes extracted automatically from the matching section in `CHANGELOG.md`.
