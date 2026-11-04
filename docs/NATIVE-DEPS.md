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

| Package                          | Version | Licence | Purpose                                                                              |
| :------------------------------- | :------ | :------ | :----------------------------------------------------------------------------------- |
| `@capacitor/core`                | `8.6.0` | MIT     | Capacitor cross-platform runtime and native bridge core.                             |
| `@capacitor/android`             | `8.6.0` | MIT     | Android native platform engine and bridge container.                                 |
| `@capacitor/app`                 | `8.1.2` | MIT     | Native application lifecycle, system back-button handling, and app state events.     |
| `@capacitor/local-notifications` | `8.3.1` | MIT     | Android system notifications, channel management, exact/inexact alarm scheduling.    |
| `@capacitor/haptics`             | `8.0.2` | MIT     | Native vibration and haptic feedback (impact, notification success/warning).         |
| `@capacitor/cli`                 | `8.6.0` | MIT     | (Dev) Capacitor CLI for synchronization, config validation, and platform management. |
| `@capacitor/assets`              | `4.0.0` | MIT     | (Dev) Asset generation tool for adaptive launcher icons and native splash screens.   |

---

## 3. Native Android Libraries (Gradle)

| Dependency                           | Version | Licence    | Purpose                                                                                  |
| :----------------------------------- | :------ | :--------- | :--------------------------------------------------------------------------------------- |
| `androidx.documentfile:documentfile` | `1.0.1` | Apache 2.0 | Storage Access Framework (SAF) tree manipulation and document management (L5 & Save As). |

---

## 4. Platform API Facts & Doze Constraints (Task N4)

1. **Channels**: Android 8.0+ (API 26+) requires notification channels. Channels cannot be upgraded to higher importance after creation, so channel IDs are versioned (`workout_v1`, `timer_v1`, `backup_v1`, `nutrition_v1`).
2. **Permissions**: Android 13+ (API 33+) requires runtime `android.permission.POST_NOTIFICATIONS`. Requested strictly in-context with Egyptian Arabic explanation, never at cold start.
3. **Exact Alarms**: Android 12+ (API 31+) restricts `SCHEDULE_EXACT_ALARM`. Required only for `rest_end` and `cardio_end`. If revoked or not permitted, timers automatically fall back to inexact alarms (`isExactNotification: true, isExactMandatory: false`) with user-visible UI warning.
4. **Doze Mode & Allow-While-Idle Rate Limits**: Alarms firing while device is in deep Doze use `allowWhileIdle: true`. Android limits `setExactAndAllowWhileIdle` to approximately 1 alarm every 9 minutes per app in Doze. This is completely safe for workout rest timers (1 to 3 minutes duration, scheduled once per rest during active sessions when screen may briefly lock).
5. **Reboot & Update Recovery**: Android OS wipes pending `AlarmManager` alarms on device reboot, app update (`MY_PACKAGE_REPLACED`), time changes, and time-zone shifts. These are re-armed via `AlarmRestoreReceiver` reading persisted atomic schedule.
