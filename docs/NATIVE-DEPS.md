# Native Dependencies and Toolchain Specification

## 1. Toolchain Requirements (Capacitor 8)

| Component                       | Required Version                       | Source / Notes                                                                 |
| :------------------------------ | :------------------------------------- | :----------------------------------------------------------------------------- |
| **Node.js**                     | `>= 22.0.0` (Active LTS: Node 22 / 24) | Pinned in CI (`node-version: 22`) and `.github/workflows`                      |
| **JDK**                         | `21` (Eclipse Temurin)                 | Target JVM 21 for AGP 8.13.0 and Gradle 8.14.3                                 |
| **Gradle**                      | `8.14.3`                               | Pinned via Gradle Wrapper (`android/gradle/wrapper/gradle-wrapper.properties`) |
| **Android Gradle Plugin (AGP)** | `8.13.0`                               | Specified in `android/build.gradle`                                            |
| **minSdkVersion**               | `24` (Android 7.0 Nougat)              | Configured in `android/variables.gradle`                                       |
| **compileSdkVersion**           | `36` (Android 16 Vanilla Ice Cream)    | Configured in `android/variables.gradle`                                       |
| **targetSdkVersion**            | `36` (Android 16 Vanilla Ice Cream)    | Configured in `android/variables.gradle`                                       |

---

## 2. Pinned NPM Dependencies Added

| Package              | Version | Licence | Purpose                                                                              |
| :------------------- | :------ | :------ | :----------------------------------------------------------------------------------- |
| `@capacitor/core`    | `8.6.0` | MIT     | Capacitor cross-platform runtime and native bridge core.                             |
| `@capacitor/android` | `8.6.0` | MIT     | Android native platform engine and bridge container.                                 |
| `@capacitor/app`     | `8.1.2` | MIT     | Native application lifecycle, system back-button handling, and app state events.     |
| `@capacitor/cli`     | `8.6.0` | MIT     | (Dev) Capacitor CLI for synchronization, config validation, and platform management. |
| `@capacitor/assets`  | `4.0.0` | MIT     | (Dev) Asset generation tool for adaptive launcher icons and native splash screens.   |

---

## 3. Native Android Libraries (Gradle)

| Dependency                           | Version | Licence    | Purpose                                                                                  |
| :----------------------------------- | :------ | :--------- | :--------------------------------------------------------------------------------------- |
| `androidx.documentfile:documentfile` | `1.0.1` | Apache 2.0 | Storage Access Framework (SAF) tree manipulation and document management (L5 & Save As). |
