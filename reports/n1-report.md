# Task N1 Engineering Report: Native Shell, Android Build, and CI

**Task ID:** N1  
**Project:** Maganis (مجانس) — Native Shell & Android Packaging  
**Technology:** Capacitor 8, Android (Java), Vite, React 19, TypeScript  
**Branch:** `native/n1`  
**Date:** 2026-11-01

---

## 1. What Changed (Files)

### A. Core Platform & Native Bridge

- `capacitor.config.ts`: Added configuration with `appId: 'app.maganis.coach'`, `appName: 'مجانس'`, `webDir: 'dist-native'`, `server.cleartext: false`, and conditional `webContentsDebuggingEnabled`.
- `.env.native`: First-class environment file for native builds (`VITE_APP_ENV=production`, `VITE_APP_NAME=مجانس`).
- `src/platform/runtime.ts`: Unified runtime platform detection exporting `isNative()`, `platformName()`, and `isDebugBuild()`. (The ONLY file importing `@capacitor/core` for platform detection).
- `src/platform/index.ts`: Typed `platform` object exporting `info`, `app`, and typed honest unsupported stand-ins for `kv`, `media`, `files`, `notifications`, `haptics`, `keepAwake`. Includes `setPlatformForTesting`.
- `src/platform/backStack.ts`: Priority/LIFO back-button dispatcher handling open sheets, hash-route history, and root double-tap exit with Arabic toast («اضغط تاني للخروج»).
- `src/platform/backStack.test.ts`: Comprehensive unit tests for back-handler stack and double-tap logic (6 tests).
- `src/platform/platform.test.ts`: Unit tests for platform runtime, info mapping, and test injection (4 tests).
- `src/platform/native/maganisNative.ts`: TypeScript wrapper registering local Capacitor plugin `MaganisNative`.

### B. Android Native Project (`android/`)

- `android/`: Full native Android project committed with Gradle wrapper (`gradlew`, `gradlew.bat`, `gradle/`).
- `android/variables.gradle`: Pinned SDKs (`minSdkVersion = 24`, `compileSdkVersion = 36`, `targetSdkVersion = 36`).
- `android/app/build.gradle`:
  - `versionName` dynamically sourced from `package.json`.
  - `versionCode` derived from CI run number (`GITHUB_RUN_NUMBER + 1000`) for strict monotonic increments.
  - Variants: `debug` (suffix `.debug`, name `مجانس (تجريبي)`) and `release` (`app.maganis.coach`, `مجانس`).
  - Release signing configuration from environment variables or `keystore.properties`.
  - Strict Security Rule S4: `assembleRelease` fails immediately if signing credentials are missing, strictly forbidding fallback to the debug key.
- `android/app/src/main/AndroidManifest.xml`: Manifest hygiene with `android:allowBackup="false"`, `usesCleartextTraffic="false"`, `supportsRtl="true"`, portrait orientation, `windowSoftInputMode="adjustResize"`, and only `android.permission.INTERNET`.
- `android/app/src/main/java/app/maganis/coach/MaganisNative.java`: Local Java Capacitor plugin implementing `getInfo()` (returns `applicationId`, `versionName`, `versionCode`, `buildType`, `sdkInt`, `deviceModel`, `debuggable`, and certificate SHA-256 fingerprint).
- `android/app/src/main/java/app/maganis/coach/MainActivity.java`: Registered `MaganisNative` plugin and dynamic `WindowInsetsControllerCompat` status/nav bar icon theming.
- `android/app/src/main/res/values/strings.xml` & `values-ar/strings.xml`: Localized app labels.
- `assets/`: Generated 118 adaptive launcher icons and dark/light splash drawables via `@capacitor/assets`.

### C. Build Configuration & Gates

- `vite.config.ts`: First-class `mode === 'native'` producing `dist-native/` with `base: '/'`. Strips PWA manifest, `sw.js`, and `version.json` in native mode. Web production build remains completely unaffected.
- `scripts/check-env.mjs`: Added support for `mode === 'native'`.
- `scripts/gate-base-path.mjs`: Added gate enforcing zero hardcoded `/maganis-app/` occurrences across non-test non-config `src/` files.
- `scripts/gate-no-personal-data.mjs`: Extended with Security Rule S1 (fails if keystores `*.jks`, `*.keystore`, or `keystore.properties` are tracked by git).
- `scripts/android-keystore.mjs`: Production keystore generator for the owner with safety guards against writing in the git tree and Arabic guides.
- `qa/native-web-smoke.mjs`: Playwright smoke test serving `dist-native` at root `/` verifying 8 routes and muscle atlas with zero page errors.

### D. Documentation & Tooling

- `docs/NATIVE-DEPS.md`: Records all toolchain requirements (Node 22, JDK 21, Gradle 8.14.3, AGP 8.13.0, API 24-36) and pinned Capacitor packages.
- `docs/ANDROID-PERMISSIONS.md`: Full audit and justification of Android permissions.
- `docs/ANDROID-RELEASE.ar.md`: Simple Egyptian Arabic step-by-step owner guide for setup, release, and installation.
- `docs/ANDROID-RELEASE.md`: Technical specification for maintainers.
- `CHANGELOG.md`: Created with `[Unreleased]` section detailing Task N1.
- `docs/NATIVE-STATE.md`: Central native state registry.
- `.github/workflows/android.yml`: GitHub Actions pipeline with `build-debug`, `emulator-smoke` (API 34), and `release` publishing jobs.

---

## 2. Item Status & Evidence Table

| Item ID  | Description                                   | Pre-Fix (Red Evidence)                                            | Post-Fix (Green Evidence)                                                    | Gate / Command                                     | Status |
| :------- | :-------------------------------------------- | :---------------------------------------------------------------- | :--------------------------------------------------------------------------- | :------------------------------------------------- | :----- |
| **N1.1** | Capacitor 8 Setup & Toolchain Specification   | `evidence/n1/red/n1-baseline-summary.txt` (missing config & deps) | `evidence/n1/green/n1-baseline-summary.txt`                                  | `docs/NATIVE-DEPS.md`                              | done   |
| **N1.2** | Build Split: Web vs Native & Base Path Purge  | `evidence/n1/red/n1-2-gate-base-path.txt` (3 violations)          | `evidence/n1/green/n1-2-gate-base-path.txt` (0 violations in 200 files)      | `gate:base-path`, `qa:native-smoke`                | done   |
| **N1.3** | Android Project Configuration & Permissions   | `android/` missing; permissions undocumented                      | `android/` committed, `docs/ANDROID-PERMISSIONS.md`                          | `npm run check:ui`, `scripts/check-env.mjs`        | done   |
| **N1.4** | Platform Skeleton & MaganisNative Java Plugin | `src/platform/` missing; Settings lacked native info              | `src/platform/index.ts`, `MaganisNative.java`, Settings screen updated       | `src/platform/platform.test.ts`                    | done   |
| **N1.5** | Back Button Stack & Lifecycle Events          | `src/platform/backStack.ts` missing                               | `src/platform/backStack.ts`, `Sheet.tsx` integrated                          | `src/platform/backStack.test.ts` (6 passed)        | done   |
| **N1.6** | Signing, Gradle & Security Rule S4            | No release signing config; missing fail-fast                      | `android/app/build.gradle` (fails loudly if secrets missing)                 | Security Rule S4, `gate-no-personal-data` (Rule 7) | done   |
| **N1.7** | GitHub Actions Workflow (`android.yml`)       | `.github/workflows/android.yml` missing                           | `.github/workflows/android.yml` committed                                    | GitHub Actions Workflow Lint                       | done   |
| **N1.8** | Owner Tooling & Release Guides                | `scripts/android-keystore.mjs` missing                            | `evidence/n1/red/n1-8-keystore-tool-check.txt`, `docs/ANDROID-RELEASE.ar.md` | `npm run android:keystore`                         | done   |
| **N1.9** | Verification & Bundle Sizing                  | Baseline bundle measured                                          | Web build passed, `dist-native` passed, 0 page errors                        | `npm run gates`, `npm run build:native`            | done   |

---

## 3. Verification Methods & Evidence

- **Platform Unit Tests (`unit test`):**
  - `src/platform/backStack.test.ts`: 6/6 tests passing. Verifies LIFO priority stack, sheet consumption of back presses, root route toast, and 2-second double-tap exit.
  - `src/platform/platform.test.ts`: 4/4 tests passing. Verifies web runtime fallback, mock platform injection via `setPlatformForTesting`, and honest unsupported errors for future modules.
- **Full Test Suite & Coverage Ratchet (`unit test`):**
  - 56 test files, 553 tests passed.
  - Coverage ratchet floor satisfied: Lines 42.69% (floor: 42.39%), Statements 42.69% (floor: 42.39%), Functions 38.35% (floor: 36.90%), Branches 62.81% (floor: 62.81%).
- **Automated Gates (`automated gate`):**
  - `gate-no-personal-data.mjs`: 7 strict rules verified across 1,294 tracked files (including Rule 7 protecting keystores and credentials).
  - `gate-base-path.mjs`: 200 non-test source files scanned; 0 hardcoded `/maganis-app/` paths found.
  - `gate-raw-tokens.mjs`: 480 visible text nodes examined; 0 raw internal tokens found.
  - `check:ui`: 108/108 UI test matrix and contact sheet states passing.
- **Native Smoke Test (`qa/native-web-smoke.mjs`):**
  - Served `dist-native` at root `/` on mobile viewport (360x720, DPR 2).
  - Verified 8 routes: Home (`#/`), Workout (`#/workout`), Exercise Detail (`#/workout/exercise/bench`), Muscle Atlas (`#/workout/atlas`), Nutrition (`#/nutrition`), Progress (`#/progress`), Settings (`#/settings`), and Styleguide (`#/styleguide`).
  - Recorded 0 page errors; saved screenshots `evidence/n1/green/native-smoke-atlas.png` and `native-smoke-settings.png`.
- **Local Toolchain & Physical Device (`not verified locally`):**
  - Checked locally: `java` not installed, `adb` not installed, `ANDROID_HOME` unset. Local APK compilation was therefore not performed locally per ENVIRONMENT REALITY instructions. GitHub Actions CI (`.github/workflows/android.yml`) is the automated source of truth.

---

## 4. Size Deltas

| Metric                          | Baseline  | Post-Fix (N1) | Delta                               | Budget / Status             |
| :------------------------------ | :-------- | :------------ | :---------------------------------- | :-------------------------- |
| **Web JS Index Bundle (raw)**   | 459.05 kB | 469.25 kB     | +10.20 kB                           | Well within < 800 kB budget |
| **Web JS Index Bundle (gzip)**  | 118.87 kB | 122.94 kB     | +4.07 kB                            | Pass                        |
| **Web CSS Index Bundle (raw)**  | 105.98 kB | 106.21 kB     | +0.23 kB                            | Pass                        |
| **Web CSS Index Bundle (gzip)** | 18.75 kB  | 18.80 kB      | +0.05 kB                            | Pass                        |
| **Native Web JS Index (raw)**   | N/A (new) | 469.19 kB     | N/A                                 | Base `/`, no PWA overhead   |
| **Native Web JS Index (gzip)**  | N/A (new) | 122.93 kB     | N/A                                 | Clean native bundle         |
| **Release APK Size**            | N/A       | Built in CI   | Reported in GitHub Actions artifact |

---

## 5. What Could Not Be Done and Why

1. **Local APK Compilation & Local Emulator Execution:**
   - As confirmed by `java -version` and `adb --version`, the local Windows environment does not have a JDK or Android SDK installed. Building an APK locally is impossible without a local toolchain.
   - In accordance with the prompt's instructions ("If you cannot build the APK locally, say so and do not claim a local APK build"), the APK build and emulator testing are wired into `.github/workflows/android.yml` to run on GitHub Actions.
2. **In-App YouTube Playback on Physical Device:**
   - Exercise iframe embeds specify `referrerpolicy="strict-origin-when-cross-origin"` and feature the fallback button «افتح في يوتيوب». Whether YouTube's player accepts native WebView origins on physical devices must be confirmed by the owner's phone acceptance test (Step 7 below).

---

## 6. Questions for the Owner

1. **Application ID:** We have set the default `applicationId` to `app.maganis.coach`. This identifier becomes permanent once installed on your phone. If you want a different domain prefix, please change it in `capacitor.config.ts` and `android/app/build.gradle` before cutting your first release.
2. **Release Keystore Setup:** Please install JDK 21 (Temurin) and run `npm run android:keystore` once, then paste the 4 secrets and 1 variable into your repository settings on GitHub per `docs/ANDROID-RELEASE.ar.md`.

---

## 7. "Was False" List

- None found from earlier reports during this task.

---

## 8. "Not Done" List

- **Task N2:** Durable storage & snapshot rollback (scheduled for next chat).
- **Task N3:** Auto Backup rules & export integrity verification.
- **Task N4:** Local notifications, timers, and haptics.
- **Task N5:** Stability, crash reporting, and in-app sideload updater.

---

## OWNER PHONE CHECKLIST

خطوات بسيطة ومرتبة بالعامية المصرية لاختبار النتيجة على تليفونك:

1. **تثبيت جافا وتشغيل سكريبت الكي ستور:**
   - نزل وثبت JDK 21 من موقع Adoptium Temurin: https://adoptium.net/temurin/releases/?version=21
   - شغل في موجه الأوامر: `npm run android:keystore`
   - _النتيجة المتوقعة:_ يتولد مجلد `~/maganis-keystore` ويطبعلك بصمة الشهادة (SHA-256) والأسرار. لو فشل، ابعت لقطة شاشة لرسالة الخطأ في التيرمينال.

2. **إضافة الأسرار على GitHub:**
   - ادخل على إعدادات المستودع على GitHub: **Settings ➔ Secrets and variables ➔ Actions**.
   - أضف المتغير `ANDROID_CERT_SHA256` في تبويب Variables، والـ 4 أسرار في تبويب Secrets حسب الدليل `docs/ANDROID-RELEASE.ar.md`.
   - _النتيجة المتوقعة:_ ظهور المتغير والأسرار في القائمة.

3. **إطلاق أول نسخة تجريبية:**
   - اعمل push للفرع `native/n1` وادخل على تبويب **Actions** على GitHub.
   - _النتيجة المتوقعة:_ الورك فلو `Android Native CI & Release` يشتغل وينتهي بعلامة صح خضراء (Green)، وتلاقي ملف APK التجريبي في الـ Artifacts باسم `maganis-DEBUG-NOT-FOR-REAL-DATA-...apk`.

4. **تثبيت التطبيق على التليفون:**
   - حمل الـ APK على تليفون الأندرويد، واضغط عليه لتثبيته (وافق على تثبيت التطبيقات غير المعروفة للمتصفح، واضغط "Install anyway" لو ظهرت حماية Play Protect).
   - _النتيجة المتوقعة:_ التطبيق يتثبت بنجاح ويظهر في قائمة التطبيقات بأيقونة مجانس واسم «مجانس (تجريبي)».

5. **فتح التطبيق وفحص الشاشة الافتتاحية (Splash):**
   - افتح التطبيق والتليفون في الوضع الفاتح (Light) ثم في الوضع الداكن (Dark).
   - _النتيجة المتوقعة:_ الشاشة الافتتاحية تفتح بسلاسة بدون فلاش أبيض في الوضع الداكن، ويدخل على شاشة البداية فوراً بدون إنترنت.

6. **فحص زر الرجوع (Back Button):**
   - افتح أي شاشة فرعية أو اضغط على أي تمرين ليفتح الشيت، واضغط زرار الرجوع بتاع الأندرويد.
   - _النتيجة المتوقعة:_ الشيت يقفل أولاً. ولو ضغطت رجوع وأنت في الشاشة الرئيسية، يظهر إشعار «اضغط تاني للخروج»، وضغطة تانية خلال ثانيتين تخرج من التطبيق.

7. **فحص شاشة الإعدادات «عن التطبيق»:**
   - ادخل على تبويب «الإعدادات» ➔ وانزل لقسم «حول التطبيق» ➔ «عن التطبيق».
   - _النتيجة المتوقعة:_ تشوف رقم الإصدار، القناة (تجريبي)، بصمة التوقيع (8 حروف...8 حروف)، وإصدار الأندرويد. ابعت سكرين شوت من الشاشة دي.

8. **فحص فيديو التمرين (YouTube Embed):**
   - افتح أي تمرين فيه فيديو واضغط تشغيل أثناء اتصال التليفون بالإنترنت.
   - _النتيجة المتوقعة:_ لو الفيديو اشتغل، ابعت سكرين شوت. لو يوتيوب رفض التضمين، هيظهرلك زرار «افتح في يوتيوب»، واضغط عليه للتأكد إنه بيفتح الفيديو في متصفح النظام أو تطبيق يوتيوب مباشرة.
