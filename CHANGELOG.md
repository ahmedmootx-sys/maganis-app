# Changelog

All notable changes to Maganis will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Capacitor 8 Native Android Shell (Task N1):**
  - Offline-first Android native application shell wrapping Vite + React + TypeScript web app.
  - Pinned Capacitor 8 suite (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`, `@capacitor/cli`, `@capacitor/assets`).
  - Distinct application variants: Debug (`app.maganis.coach.debug` / «مجانس (تجريبي)») and Release (`app.maganis.coach` / «مجانس»).
  - Native platform layer `src/platform/` with runtime detection, platform info, and LIFO back-button stack.
  - Native Capacitor plugin `MaganisNative` providing device model, SDK version, and signing certificate fingerprint.
  - Adaptive launcher icons and dark/light splash screens generated from brand assets.
  - Edge-to-edge system bars integration respecting dynamic navigation and status bar themes.
  - GitHub Actions workflow `.github/workflows/android.yml` for automated debug APK artifacts, emulator testing, and release APK publishing.
  - Owner keystore generation tooling (`scripts/android-keystore.mjs`) and Arabic owner release guide (`docs/ANDROID-RELEASE.ar.md`).
